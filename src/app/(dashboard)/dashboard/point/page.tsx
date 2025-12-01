"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { showToast } from '@/lib/toastHelper';
import styles from './point.module.css'

import { FaStar, FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoRefreshOutline } from "react-icons/io5";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";

// Quantity maximal untuk redeem satu item
const MAX_QUANTITY = 99;
const ITEMS_PER_PAGE = 4;
interface RewardItem {
  id: number;
  category_id: number;
  reward_name: string;
  vendor_name: string;
  image_path: string;
  points_required: number;
  total_redeemed: number;
  stock: number;
}

interface FilterItem {
  id: number;
  category_name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  entryFrom: number;
  entryTo: number;
}

export default function PointPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session) router.push('/login')
  }, [session])

  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [filterCategories, setFilterCategories] = useState<FilterItem[]>([]);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);

  const handleAddItem = (itemId: number) => {
    setCartItems(prev => ({
      ...prev,
      [itemId]: Math.min((prev[itemId] || 0) + 1, MAX_QUANTITY)
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems(prev => {
      const newCount = (prev[itemId] || 0) - 1;
      if (newCount <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newCount };
    });
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    if (value === '') {
      setCartItems(prev => ({
        ...prev,
        [itemId]: 0
      }));
      return;
    }

    const numValue = parseInt(value);
    
    if (isNaN(numValue)) {
      return;
    }

    if (numValue >= 0) {
      const finalValue = Math.min(Math.max(numValue, 0), MAX_QUANTITY);
      setCartItems(prev => ({
        ...prev,
        [itemId]: finalValue
      }));
    }
  };

  // Fetch API buat kategori apa aja yang ada nanti filter
  const getFilterCategories = async () => {
    try {
      setIsLoadingFilters(true);
      const response = await fetch("/api/dashboard/point-reward/get-filters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setFilterCategories(result.data);
    } catch (error) {
      console.error("Error saat mengambil data filter: ", error);
    } finally {
      setIsLoadingFilters(false);
    }
  }

  // Fetch API buat data item yang bakal ditampilin (include filter, search dan pagination)
  const getRewardItems = async () => {
    try {
      setIsLoadingItems(true);
      const response = await fetch("/api/dashboard/point-reward/get-reward-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          categoryId: selectedCategory,
          search: debouncedSearch 
        })
      });
      
      const result = await response.json();
      setRewardItems(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error saat mengambil data reward item: ", error);
    } finally {
      setIsLoadingItems(false);
    }
  }

  // Insert redemption
  const inputRedeemTransaction = async () => {
    try {
      const payloadItems = Object.keys(cartItems).map(key => ({
        reward_id: parseInt(key),
        quantity: cartItems[key]
      }));

      const response = await fetch("/api/dashboard/point-reward/redeem", {
        method: "POST",
        headers: {"Content-Type": "appplication/json"},
        body: JSON.stringify({
          user_id: session?.user?.id,
          items: payloadItems,
        })
      });
      
      const result = await response.json();
      showToast(result.message, result.detail);
      if(result.message === "SUCCESS") {
        await update({
          ...session,
          user: {
            ...session?.user,
            points: result.data.new_point_balance
          }
        });
        setCartItems({});
      }
    } catch (error) {
      console.error("Error saat mengambil data reward item: ", error);
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRedeemItem = () => {
    inputRedeemTransaction();
  }

  useEffect(() => {
    getFilterCategories();
  }, []);

  useEffect(() => {
    getRewardItems();
  }, [currentPage, selectedCategory, debouncedSearch]);

  const hasItems = Object.keys(cartItems).length > 0;
  console.log("cart items: ", cartItems);

  return (
    <>
      <div className={styles.poinHeader}>
        <h1>Poin & Reward</h1>
        <p>Yuk tukarkan poin yang kamu punya disini.</p>
      </div>

      <div className={styles.topRow}>
        <div className={styles.poinCard}>
          <div className={styles.poinCardHeaderContainer}>
            <div className={styles.poinCardLogoContainer}>
              <FaStar />
            </div>
            <p>Jumlah poin yang dikumpulkan</p>
          </div>

          <div className={styles.poinCardContent}>
            <h1>{session?.user?.points}</h1>
            <p>Poin</p>
          </div>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <button 
          className={`${styles.filterContainer} `} 
          onClick={handleResetFilter}
          style={{ cursor: 'pointer' }}
        >
          <IoRefreshOutline style={{color: '#A4B465'}}/> Reset
        </button>

        {isLoadingFilters ? (
          <p>Loading filters...</p>
        ) : (
          filterCategories.map((category) => (
            <button 
              key={category.id}
              className={`${styles.filterContainer} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.category_name}
            </button>
          ))
        )}
      </div>

      <div className={styles.itemsGroup}>
        <div className={styles.itemsHeaderContainer}>
          <form 
            className={styles.searchBar}
            onSubmit={handleSearchSubmit}
          >
            <FaSearch style={{color: '#999'}}/>
            <input 
              type="text" 
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari barang yang anda diinginkan'
            />
            <button type="submit" style={{display: 'none'}}>Search</button>
          </form>


          <button 
            className={styles.redeemButton}
            style={{ display: hasItems ? 'block' : 'none' }}
            onClick={handleRedeemItem}
          >
            Redeem Items
          </button>
        </div>

        {isLoadingItems ? (
          <div className={styles.loadingContainer}>
            <p>Loading items...</p>
          </div>
        ) : rewardItems.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>Tidak ada item yang ditemukan</p>
          </div>
        ) : (
          <>
          </>
        )}
        <div className={styles.itemsContainer}>
          {!isLoadingItems && rewardItems.length > 0 && rewardItems.map((item) => {
            const quantity = cartItems[item.id] || 0;
            
            return (
              <div key={item.id} className={styles.itemsCard}>
                <div className={styles.cardImageContainer}>
                  <img src={item.image_path ? item.image_path : "/images/dummy.png"} alt={item.reward_name} />
                </div>

                <div className={styles.cardContentContainer}>
                  <div className={styles.contentTitle}>
                    <h1>{item.reward_name}</h1>
                    <p>by {item.vendor_name}</p>
                  </div>

                  <div className={styles.contentPoint}>
                    <h1>{item.points_required} Points</h1>
                  </div>

                  <div className={styles.contentFooter}>
                    <div className={styles.contentInfo}>
                      <p>Sudah ditukar 1x</p>
                      <p>{item.total_redeemed}+ ditukar</p>
                    </div>

                    <div className={styles.buttonContainer}>
                      {quantity === 0 && !cartItems.hasOwnProperty(item.id) ? (
                        <button 
                          className={styles.addButton}
                          onClick={() => handleAddItem(item.id)}
                        >
                          <FaCirclePlus style={{color: '#A4B465'}}/>
                        </button>
                      ) : (
                        <div className={styles.quantityControls}>
                          <div className={styles.quantityControlsContainer}>
                            <button 
                              className={styles.minusButton}
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <FaCircleMinus style={{color: '#A4B465'}}/>
                            </button>
                            <input 
                              type="text"
                              className={styles.quantityInput}
                              value={quantity === 0 ? '' : quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value === '' || parseInt(e.target.value) === 0) {
                                  setCartItems(prev => ({
                                    ...prev,
                                    [item.id]: 1
                                  }));
                                }
                              }}
                            />
                            <button 
                              className={styles.plusButton}
                              onClick={() => handleAddItem(item.id)}
                            >
                              <FaCirclePlus style={{color: '#A4B465'}}/>
                            </button>
                          </div>

                          {quantity >= MAX_QUANTITY && (
                            <p className={styles.maxNotice}>Max. {MAX_QUANTITY} items</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <p className={styles.totalItems}>
              Menampilkan {pagination.entryFrom} - {pagination.entryTo} dari {pagination.totalItems} items
            </p>

            <div className={styles.paginationButtonContainer}>
              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <FaArrowLeft />
              </button>

              <div className={styles.paginationInfo}>
                <span>
                  {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}