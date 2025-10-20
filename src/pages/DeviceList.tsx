import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { devicesApi } from "@/api/devices";

import { toast } from "sonner";

const DeviceList = () => {
  const { brandId } = useParams();
  const [devices, setDevices] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!brandId) return;

      try {
        // 🔹 Step 1: Lookup brand UUID by its name (slug)
        const { data: brand, error: brandError } = await window.supabase
          .from("device_brands")
          .select("id, name")
          .eq("name", brandId)
          .single();

        if (brandError || !brand) {
          console.error("Error fetching brand:", brandError);
          toast.error("Brand not found");
          setIsLoading(false);
          return;
        }

        // 🔹 Step 2: Fetch devices using UUID
        const devicesData = await devicesApi.getDevicesByBrand(brand.id);
        setDevices(devicesData);

        // 🔹 Step 3: Display brand name
        setBrandName(brand.name);
      } catch (error) {
        console.error("Error fetching devices:", error);
        toast.error("Failed to load devices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, [brandId]);

  if (isLoading) {
    return <p className="text-center py-8">Loading devices...</p>;
  }

  if (!devices.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">
          No devices found for this brand.
        </h2>
        <Link to="/">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Choose Your {brandName} Device
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="p-4 flex flex-col items-center text-center hover:shadow-lg transition"
          >
            <img
              src={
                device.image_url ||
                "https://via.placeholder.com/150?text=No+Image"
              }
              alt={device.name}
              className="w-24 h-24 object-contain mb-2"
            />
            <p className="font-medium">{device.name}</p>
            {device.model_number && (
              <p className="text-sm text-gray-500">{device.model_number}</p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Brands
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DeviceList;
