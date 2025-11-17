import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("req update user: ", body);

        const { 
            email, 
            firstName, 
            lastName,
            phoneNumber, 
            address, 
            wasteTarget,
            postalCode,
            province,
            regency,
            subdistrict 
        } = body;
        if (!email) {
            return NextResponse.json({ 
                message: 'Email is required' 
            }, { status: 400 });
        }

        // validate dulu user nya ada gak
        let checkSql = `
            SELECT *
            FROM ms_users
            WHERE email = ? 
            LIMIT 1;
        `;
        const [userExists] = await query(checkSql, [email]);
        // console.log("userExists: ", userExists);
        if (!userExists) {
            return NextResponse.json({ 
                message: 'Error checking user' 
            }, { status: 500 });
        }

        // Cek ada yang berubah gak
        const wasteTargetDB = parseFloat(userExists.waste_target);
        const addressDB = userExists.address ?? "";
        if (
            userExists.first_name === firstName &&
            userExists.last_name === lastName &&
            userExists.phone_number === phoneNumber &&
            addressDB === address &&
            wasteTargetDB === wasteTarget && 
            userExists.postal_code === postalCode &&
            userExists.province === province &&
            userExists.regency === regency &&
            userExists.subdistrict === subdistrict
        ) {
            return NextResponse.json({
                updated: false,
                message: 'No changes were made to the profile.'
            }, { status: 200 });
        }

        console.log("update...")
        // Update profile kalau ada yang berubah
        let updateSql = `
            UPDATE ms_users
            SET 
                first_name = ?,
                last_name = ?,
                phone_number = ?,
                address = ?,
                postal_code = ?,
                province = ?,
                regency = ?,
                subdistrict = ?,
                waste_target = ?
            WHERE email = ?;
        `
        const updateUser = await query(updateSql, [
            firstName, 
            lastName, 
            phoneNumber, 
            address, 
            postalCode,
            province,
            regency,
            subdistrict,
            wasteTarget,
            email
        ]);
        if (!updateUser) {
            return NextResponse.json({ 
                message: 'Error updating user' 
            }, { status: 500 });
        }
        // console.log("updateUser: ", updateUser);

        // Jika berhasil update, kirim respons sukses
        return NextResponse.json({
            updated: true,
            message: 'Profile updated successfully!',
            data: {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                address: address,
                postal_code: postalCode,
                province: province,
                regency: regency,
                subdistrict: subdistrict,
                waste_target: wasteTarget,
            }
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            message: 'An error occurred', 
            error : error,
        }, { status: 500 });
    }
}