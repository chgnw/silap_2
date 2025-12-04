import toast from "react-hot-toast";

type ToastStatus = "success" | "error" | "failed" | "OK" | number | boolean;

export const showToast = (status: ToastStatus, message: string) => {    
    let isSuccess = false;

    if (typeof status === "number") {
        isSuccess = status >= 200 && status < 300;
    } else if (typeof status === "boolean") {
        isSuccess = status;
    } else if (typeof status === "string") {
        const lowerStatus = status.toLowerCase();
        isSuccess = lowerStatus === "success" || lowerStatus === "ok";
    }

    if (isSuccess) {
        toast.success(message, {
            duration: 4000,
            style: {
                background: "#2F5E44",
                color: "#FFF",
            },
        });
    } else {
        toast.error(message, {
            duration: 4000,
            style: {
                background: "#ED1C24",
                color: "#FFF",
            },
        });
    }
};
