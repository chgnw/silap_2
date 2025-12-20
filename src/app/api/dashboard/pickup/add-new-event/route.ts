import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateTransactionCode } from "@/lib/transactionCode";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract data from FormData
    const userData = JSON.parse(formData.get("userData") as string);
    const pickupType = JSON.parse(formData.get("pickupType") as string);
    const vehicle = JSON.parse(formData.get("vehicle") as string);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const weight = formData.get("weight") as string;
    const notes = (formData.get("notes") as string) || null;
    const imageFile = formData.get("image") as File | null;
    const pickupRegency = (formData.get("pickupRegency") as string) || null;

    const user_id = userData.user_id;
    const pickup_address = userData.address;
    const pickup_regency = pickupRegency;
    const pickup_type_id = pickupType.id;
    const eventDateTime = new Date(`${date}T${time}:00+07:00`);
    const event_date = eventDateTime.toISOString().split("T")[0];
    const pickup_time = time;
    const vehicle_category_id = vehicle.id; // Changed from vehicle_id to vehicle_category_id
    const pickup_weight = parseFloat(weight);

    let image_url = null;

    // Handle image upload if exists
    if (imageFile) {
      try {
        // Get file extension
        const originalName = imageFile.name;
        const fileExtension = originalName.split(".").pop()?.toLowerCase();

        // Validate extension
        if (!["png", "jpg", "jpeg"].includes(fileExtension || "")) {
          return NextResponse.json(
            {
              message: "INVALID_FILE_TYPE",
              error:
                "Format file tidak valid. Hanya PNG, JPG, dan JPEG yang diperbolehkan.",
            },
            { status: 400 }
          );
        }

        // Format date as DDMMYYYY
        const dateObj = new Date(date);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const formattedDate = `${day}${month}${year}`;

        // Create filename: [user_id]_[DDMMYYYY]_[original_filename].[ext]
        const formattedFilename = `${user_id}_${formattedDate}_${originalName}`;

        // Create directory if not exists
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "upload",
          "pickupEvent"
        );
        await mkdir(uploadDir, { recursive: true });

        // Save file
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadDir, formattedFilename);
        await writeFile(filePath, buffer);

        // Store relative path for DB: pickupEvent/filename
        image_url = `pickupEvent/${formattedFilename}`;
      } catch (fileError: any) {
        console.error("Error uploading file:", fileError);
        return NextResponse.json(
          {
            message: "FILE_UPLOAD_ERROR",
            error: "Gagal mengunggah gambar.",
            details: fileError.message,
          },
          { status: 500 }
        );
      }
    }

    const checkSql = `
            SELECT id FROM tr_pickup_event 
            WHERE user_id = ? 
            AND event_date = ? 
            AND pickup_time = ? 
            AND pickup_address = ?
            LIMIT 1
        `;

    const existingEvent = await query(checkSql, [
      user_id,
      event_date,
      pickup_time,
      pickup_address,
    ]);

    if (Array.isArray(existingEvent) && existingEvent.length > 0) {
      return NextResponse.json(
        {
          message: "DUPLICATE_EVENT",
          error: "Jadwal penjemputan duplikat ditemukan.",
          details:
            "Anda sudah memiliki jadwal penjemputan di waktu dan lokasi yang sama persis.",
        },
        { status: 409 }
      );
    }

    // Generate transaction code for pickup event
    const transaction_code = generateTransactionCode("PCK");

    const sql = `
        INSERT INTO tr_pickup_event (transaction_code, user_id, pickup_address, pickup_regency, pickup_weight, pickup_type_id, event_date, pickup_time, vehicle_category_id, image_url, user_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const result = await query(sql, [
      transaction_code,
      user_id,
      pickup_address,
      pickup_regency,
      pickup_weight,
      pickup_type_id,
      event_date,
      pickup_time,
      vehicle_category_id,
      image_url,
      notes,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          ...result,
          transaction_code,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /dashboard/add-new-event :", error);
    return NextResponse.json(
      {
        message: "FAILED",
        error: "Error in /dashboard/add-new-event : ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
