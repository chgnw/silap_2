'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

import { showToast } from '@/lib/toastHelper';
import AdminTable from '../../../components/Large/DataTable/DataTable';
import Modal from '../../../components/Large/Modal/Modal';
import styles from './waste.module.css';

type WasteCategory = {
  id: number;
  waste_category_name: string;
  icon_name: string | null;
};

type WasteItem = {
  id: number;
  waste_item_name: string;
  waste_category_id: number;
  waste_category_name: string;
  unit: string;
  points_per_unit: number;
  image_url: string | null;
};

export default function WastePage() {
  const [activeTab, setActiveTab] = useState<'category' | 'item'>('category');
  
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [items, setItems] = useState<WasteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: number, type: 'category' | 'item'} | null>(null);

  const fetchWasteCategories = async () => {
    try {
      const response = await fetch("/api/admin/waste-category/get-waste-cat");
      const result = await response.json();
      setCategories(result.data || []);
    } catch (error) {
      console.error("Failed getting waste categories data: ", error);
      showToast("error", "Failed retrieving categories data");
    }
  }

  const fetchWasteItems = async () => {
    try {
      const response = await fetch("/api/admin/waste-item/get-waste-items");
      const result = await response.json();
      setItems(result.data || []);
    } catch (error) {
      console.error("Failed getting waste items data: ", error);
      showToast("error", "Failed retrieving items data")
    }
  }

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchWasteCategories(), fetchWasteItems()])
      .finally(() => setIsLoading(false));
  }, []);


  // =========================================
  // LOGIC CATEGORY (CRUD)
  // =========================================
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catMode, setCatMode] = useState<'view' | 'edit' | 'add'>('add');
  const [selectedCat, setSelectedCat] = useState<WasteCategory | null>(null);

  const [catFormName, setCatFormName] = useState('');
  const [catIconFile, setCatIconFile] = useState<File | null>(null);
  const [catIconPreview, setCatIconPreview] = useState<string | null>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCatModalOpen) {
      if (catMode === 'add') {
        setCatFormName('');
        setCatIconFile(null);
        setCatIconPreview(null);
      } else if (selectedCat) {
        setCatFormName(selectedCat.waste_category_name);
        setCatIconFile(null);
        setCatIconPreview(selectedCat.icon_name); 
      }
    }
  }, [isCatModalOpen, catMode, selectedCat]);

  const handleActionCat = (mode: 'view' | 'edit' | 'add', data?: WasteCategory) => {
    setCatMode(mode);
    setSelectedCat(data || null);
    setIsCatModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCatIconFile(file);
      setCatIconPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('waste_category_name', catFormName);
    if (catIconFile) formData.append('image', catIconFile);

    try {
      let url = "/api/admin/waste-category/add-waste-cat";
      let method = "POST";

      if (catMode === 'edit' && selectedCat) {
        url = "/api/admin/waste-category/edit-waste-cat";
        formData.append('id', selectedCat.id.toString());
      }

      const response = await fetch(url, {
        method: method,
        body: formData
      });
      const result = await response.json();

      if (response.ok) {
        showToast("success", `Category ${catMode === 'add' ? 'Added' : 'Updated'} Successfully!`);
        setIsCatModalOpen(false);
        fetchWasteCategories();
      } else {
        showToast("failed", `Failed: ${result.message}`)
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showToast("failed", "Error saving catgory data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (id: number, type: 'category' | 'item') => {
    setDeleteTarget({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    console.log("delete target: ",deleteTarget);

    setIsSubmitting(true);

    try {
      const endpoint = deleteTarget.type === 'category' 
        ? "/api/admin/waste-category/delete-waste-cat" 
        : "/api/admin/waste-item/delete-waste-item";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const result = await response.json();

      if (response.ok) {
        showToast("success", "Deleted successfully!");
        setIsDeleteModalOpen(false);
        
        if (deleteTarget.type === 'category') fetchWasteCategories();
        else fetchWasteItems();
      } else {
        showToast("error", `Failed: ${result.message}`);
      }
    } catch (error) {
      showToast("error", "Error deleting data!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsCategory = useMemo<ColumnDef<WasteCategory>[]>(
    () => [
      { 
        header: 'No', 
        accessorFn: (_, i) => i + 1, 
        size: 50 
      },
      { 
        header: 'Name', 
        accessorKey: 'waste_category_name' 
      },
      { 
        header: 'Icon', 
        accessorKey: 'icon_name', 
        cell: ({ getValue }) => {
          const path = getValue() as string;
          if (!path) return '-';
        
          return path.split('/').pop(); 
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className={styles.actionRow}>
              <button onClick={() => handleActionCat('view', row.original)} className={`${styles.btnAction} ${styles.btnView}`}><FaEye/></button>
              <button onClick={() => handleActionCat('edit', row.original)} className={`${styles.btnAction} ${styles.btnEdit}`}><FaEdit/></button>
              <button 
                onClick={() => triggerDelete(row.original.id, 'category')}
                className={`${styles.btnAction} ${styles.btnDelete}`}
              >
                  <FaTrash/>
              </button>
          </div>
        ),
      },
    ], []
  );


  // =========================================
  // LOGIC ITEM
  // =========================================
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemMode, setItemMode] = useState<'view' | 'edit' | 'add'>('add');
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);

  const [itemIconFile, setItemIconFile] = useState<File | null>(null);
  const [itemIconPreview, setItemIconPreview] = useState<string | null>(null);
  const itemFileInputRef = React.useRef<HTMLInputElement>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    unit: '',
    points: ''
  });

  useEffect(() => {
    if (isItemModalOpen) {
      if (itemMode === 'add') {
        setItemForm({ name: '', categoryId: '', unit: '', points: '' });
        setItemIconFile(null);    
        setItemIconPreview(null); 
      } else if (selectedItem) {
        setItemForm({
          name: selectedItem.waste_item_name,
          categoryId: selectedItem.waste_category_id.toString(),
          unit: selectedItem.unit,
          points: selectedItem.points_per_unit.toString()
        });
        setItemIconFile(null);
        setItemIconPreview(selectedItem.image_url);
      }
    }
  }, [isItemModalOpen, itemMode, selectedItem]);

  const handleActionItem = (mode: 'view' | 'edit' | 'add', data?: WasteItem) => {
    setItemMode(mode);
    setSelectedItem(data || null);
    setIsItemModalOpen(true);
  };

  const handleItemFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemIconFile(file);
      setItemIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('waste_item_name', itemForm.name);
    formData.append('waste_category_id', itemForm.categoryId);
    formData.append('unit', itemForm.unit);
    formData.append('points_per_unit', itemForm.points);

    if (itemIconFile) {
      formData.append('image', itemIconFile);
    }

    try {
      let url = "/api/admin/waste-item/add-waste-item";
      let method = "POST";

      if (itemMode === 'edit' && selectedItem) {
        url = "/api/admin/waste-item/edit-waste-item";
        method = "POST";
        formData.append('id', selectedItem.id.toString());
      }

      const response = await fetch(url, {
        method: method,
        body: formData
      });
      
      const result = await response.json();

      if (response.ok) {
        showToast("success", `Item ${itemMode === 'add' ? 'Added' : 'Updated'} Successfully!`);
        setIsItemModalOpen(false);
        fetchWasteItems();
      } else {
        showToast("error", `Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      showToast("error", "Server Error");
    }
  };

  const columnsItem = useMemo<ColumnDef<WasteItem>[]>(
    () => [
      { 
        header: 'No', 
        accessorFn: (_, i) => i + 1, size: 50 
      },
      { 
        header: 'Item Name', 
        accessorKey: 'waste_item_name' 
      },
      { 
        header: 'Category', 
        accessorKey: 'waste_category_name' 
      },
      { 
        header: 'Unit', 
        accessorKey: 'unit' 
      },
      { 
        header: 'Points',
        accessorKey: 'points_per_unit' 
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className={styles.actionRow}>
            <button onClick={() => handleActionItem('view', row.original)} className={`${styles.btnAction} ${styles.btnView}`}><FaEye/></button>
            <button onClick={() => handleActionItem('edit', row.original)} className={`${styles.btnAction} ${styles.btnEdit}`}><FaEdit/></button>
            <button 
                onClick={() => triggerDelete(row.original.id, 'item')}
                className={`${styles.btnAction} ${styles.btnDelete}`}
            >
                <FaTrash/>
            </button>
          </div>
        ),
      },
    ], []
  );


  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Master Waste Management</h1>
        <i className={styles.pageSubtitle}>Manage waste categories and items along with detailed item pricing.</i>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'category' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('category')}
        >
          Waste Categories
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'item' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('item')}
        >
          Waste Items
        </button>
      </div>

      {activeTab === 'category' ? (
        <AdminTable 
          columns={columnsCategory} 
          data={categories} 
          isLoading={isLoading} 
          onAdd={() => handleActionCat('add')}
        />
      ) : (
        <AdminTable 
          columns={columnsItem} 
          data={items} 
          isLoading={isLoading} 
          onAdd={() => handleActionItem('add')}
        />
      )}

      {/* Modal Waste Category */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={`${catMode === 'add' ? 'Add' : catMode === 'edit' ? 'Edit' : 'Detail'} Category`}
      >
        <form className={styles.splitLayout} onSubmit={handleSaveCategory}>
          <div className={styles.imageSection}>
            <label className={styles.formLabel}>Icon</label>
            
            <div className={styles.imagePreview}>
              {catIconPreview ? (
                <img src={catIconPreview} alt="Preview" />
              ) : (
                selectedCat?.icon_name ? <span style={{fontSize: 30}}>📦</span> : <span className={styles.placeholderText}>No Icon</span>
              )}
            </div>

            {catMode !== 'view' && (
              <>
                <input 
                  type="file" 
                  ref={catFileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }} 
                />
                
                <button 
                  type="button" 
                  className={`${styles.btnBase} ${styles.uploadBtn}`}
                  onClick={() => catFileInputRef.current?.click()}
                >
                  Upload Icon
                </button>
              </>
            )}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category Name</label>
              <input 
                className={styles.formInput} 
                value={catFormName}
                onChange={(e) => setCatFormName(e.target.value)}
                disabled={catMode === 'view'}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className={styles.modalFooter}>
              {catMode === 'view' ? (
                <button type="button" onClick={() => setIsCatModalOpen(false)} className={`${styles.btnBase} ${styles.btnCancel}`}>Close</button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsCatModalOpen(false)} className={`${styles.btnBase} ${styles.btnCancel}`}>Cancel</button>
                  <button type="submit" className={`${styles.btnBase} ${styles.btnSave}`} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Waste Item */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={`${itemMode === 'add' ? 'Add' : itemMode === 'edit' ? 'Edit' : 'Detail'} Waste Item`}
      >
        <form className={styles.splitLayout} onSubmit={handleSaveItem}>
          <div className={styles.imageSection}>
            <label className={styles.formLabel}>Image</label>
            <div className={styles.imagePreview}>
              {itemIconPreview ? (
                <img src={itemIconPreview} alt="Preview" />
              ) : (
                <span className={styles.placeholderText}>No Image</span>
              )}
            </div>
            
            {itemMode !== 'view' && (
              <>
                <input 
                  type="file" 
                  ref={itemFileInputRef}
                  onChange={handleItemFileChange}
                  accept="image/*"
                  style={{ display: 'none' }} 
                />
                <button 
                  type="button" 
                  className={`${styles.btnBase} ${styles.uploadBtn}`}
                  onClick={() => itemFileInputRef.current?.click()}
                >
                  Upload Image
                </button>
              </>
            )}
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Item Name</label>
              <input 
                className={styles.formInput} 
                value={itemForm.name}
                onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                disabled={itemMode === 'view'}
                placeholder="Ex: Botol Aqua Bekas"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select 
                className={styles.formSelect}
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
                disabled={itemMode === 'view'}
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.waste_category_name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unit</label>
                <input 
                  className={styles.formInput} 
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({...itemForm, unit: e.target.value})}
                  disabled={itemMode === 'view'}
                  placeholder="kg / pcs"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Points per Unit</label>
                <input 
                  type="number"
                  className={styles.formInput} 
                  value={itemForm.points}
                  onChange={(e) => setItemForm({...itemForm, points: e.target.value})}
                  disabled={itemMode === 'view'}
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              {itemMode === 'view' ? (
                <button type="button" onClick={() => setIsItemModalOpen(false)} className={`${styles.btnBase} ${styles.btnCancel}`}>Close</button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsItemModalOpen(false)} className={`${styles.btnBase} ${styles.btnCancel}`}>Cancel</button>
                  <button type="submit" className={`${styles.btnBase} ${styles.btnSave}`} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Shared Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)} 
        title="Confirm Delete"
      >
        <div className={styles.singleLayout}>
            <div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Are you sure you want to delete this {deleteTarget?.type}?
                </p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    This action cannot be undone.
                </p>
            </div>

            <div className={styles.modalFooter} style={{ width: '100%', justifyContent: 'center', borderTop: 'none' }}>
                <button 
                    type="button" 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    className={`${styles.btnBase} ${styles.btnCancel}`}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    onClick={confirmDelete} 
                    className={`${styles.btnBase} ${styles.btnDeleteConfirm}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                </button>
            </div>
        </div>
      </Modal>

    </div>
  );
}