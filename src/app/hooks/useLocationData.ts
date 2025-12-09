import { useState, useCallback } from "react";

interface LocationItem {
  id: string;
  text: string;
}

interface LocationCache {
  provinces?: LocationItem[];
  regencies?: { [key: string]: LocationItem[] };
  districts?: { [key: string]: LocationItem[] };
  villages?: { [key: string]: LocationItem[] };
  postalCodes?: { [key: string]: string[] };
}

const cache: LocationCache = {};

export const useLocationData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchProvinces = useCallback(async (): Promise<LocationItem[]> => {
    if (cache.provinces) {
      return cache.provinces;
    }

    try {
      const res = await fetch("/api/location/provinces");
      const data = await res.json();

      if (data.message === "SUCCESS") {
        cache.provinces = data.data;
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
    }
  }, []);

  const fetchRegencies = useCallback(
    async (provinceId: string): Promise<LocationItem[]> => {
      if (!cache.regencies) cache.regencies = {};
      if (cache.regencies[provinceId]) {
        return cache.regencies[provinceId];
      }

      try {
        const res = await fetch(
          `/api/location/regencies?province_id=${provinceId}`
        );
        const data = await res.json();

        if (data.message === "SUCCESS") {
          cache.regencies[provinceId] = data.data;
          return data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching regencies:", error);
        return [];
      }
    },
    []
  );

  const fetchDistricts = useCallback(
    async (regencyId: string): Promise<LocationItem[]> => {
      if (!cache.districts) cache.districts = {};
      if (cache.districts[regencyId]) {
        return cache.districts[regencyId];
      }

      try {
        const res = await fetch(
          `/api/location/districts?regency_id=${regencyId}`
        );
        const data = await res.json();

        if (data.message === "SUCCESS") {
          cache.districts[regencyId] = data.data;
          return data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching districts:", error);
        return [];
      }
    },
    []
  );

  const fetchVillages = useCallback(
    async (districtId: string): Promise<LocationItem[]> => {
      if (!cache.villages) cache.villages = {};
      if (cache.villages[districtId]) {
        return cache.villages[districtId];
      }

      try {
        const res = await fetch(
          `/api/location/villages?district_id=${districtId}`
        );
        const data = await res.json();

        if (data.message === "SUCCESS") {
          cache.villages[districtId] = data.data;
          return data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching villages:", error);
        return [];
      }
    },
    []
  );

  const fetchPostalCodes = useCallback(
    async (
      village: string,
      province?: string,
      regency?: string,
      subdistrict?: string
    ): Promise<string[]> => {
      const cacheKey = `${province}-${regency}-${subdistrict}-${village}`;
      if (!cache.postalCodes) cache.postalCodes = {};
      if (cache.postalCodes[cacheKey]) {
        return cache.postalCodes[cacheKey];
      }

      try {
        const params = new URLSearchParams({
          village,
          ...(province && { province }),
          ...(regency && { regency }),
          ...(subdistrict && { subdistrict }),
        });

        const res = await fetch(`/api/location/postal-codes?${params}`);
        const data = await res.json();

        if (data.message === "SUCCESS") {
          cache.postalCodes[cacheKey] = data.data;
          return data.data;
        }
        return [];
      } catch (error) {
        console.error("Error fetching postal codes:", error);
        return [];
      }
    },
    []
  );

  const loadLocationHierarchy = useCallback(
    async (
      province: string,
      regency?: string,
      subdistrict?: string,
      village?: string
    ): Promise<{
      provinces: LocationItem[];
      regencies: LocationItem[];
      districts: LocationItem[];
      villages: LocationItem[];
      selectedIds: {
        provinceId: string;
        regencyId: string;
        districtId: string;
        villageId: string;
      };
    }> => {
      setIsLoading(true);

      try {
        const provinces = await fetchProvinces();
        const currentProvince = provinces.find((p) => p.text === province);

        if (!currentProvince) {
          return {
            provinces,
            regencies: [],
            districts: [],
            villages: [],
            selectedIds: {
              provinceId: "",
              regencyId: "",
              districtId: "",
              villageId: "",
            },
          };
        }

        const regencies = await fetchRegencies(currentProvince.id);
        const currentRegency = regency
          ? regencies.find((r) => r.text === regency)
          : undefined;

        if (!currentRegency) {
          return {
            provinces,
            regencies,
            districts: [],
            villages: [],
            selectedIds: {
              provinceId: currentProvince.id,
              regencyId: "",
              districtId: "",
              villageId: "",
            },
          };
        }

        const districts = await fetchDistricts(currentRegency.id);
        const currentDistrict = subdistrict
          ? districts.find((d) => d.text === subdistrict)
          : undefined;

        if (!currentDistrict) {
          return {
            provinces,
            regencies,
            districts,
            villages: [],
            selectedIds: {
              provinceId: currentProvince.id,
              regencyId: currentRegency.id,
              districtId: "",
              villageId: "",
            },
          };
        }

        const villages = await fetchVillages(currentDistrict.id);
        const currentVillage = village
          ? villages.find((v) => v.text === village)
          : undefined;

        return {
          provinces,
          regencies,
          districts,
          villages,
          selectedIds: {
            provinceId: currentProvince.id,
            regencyId: currentRegency.id,
            districtId: currentDistrict.id,
            villageId: currentVillage?.id || "",
          },
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages]
  );

  return {
    isLoading,
    fetchProvinces,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
    fetchPostalCodes,
    loadLocationHierarchy,
  };
};
