import https from "https";

/**
 * Fetches data from alamat.thecloudalert.com API.
 *
 * This API has an incomplete SSL certificate chain (missing intermediate cert),
 * so we use a raw https.get with rejectUnauthorized: false **only** for this host.
 * All other fetch calls in the app remain fully SSL-verified.
 */
export async function locationFetch(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(
            url,
            { rejectUnauthorized: false },
            (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        reject(new Error("Failed to parse JSON response"));
                    }
                });
            }
        ).on("error", (err) => {
            reject(err);
        });
    });
}
