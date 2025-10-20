import { FaRegNewspaper,  FaDesktop, FaDrumSteelpan, FaBiohazard, FaTshirt } from 'react-icons/fa';
import { GiWaterBottle } from "react-icons/gi";
import { MdFastfood } from "react-icons/md";

const WasteTypes = [
    {
        id: 1,
        name: "Kertas",
        Icon: FaRegNewspaper,
        SubCategory: [
            { id: 1, name: "Kertas 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Kertas 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Kertas 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 2,
        name: "Plastik",
        Icon: GiWaterBottle,
        SubCategory: [
            { id: 1, name: "Plastik 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Plastik 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Plastik 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 3,
        name: "Elektronik",
        Icon: FaDesktop,
        SubCategory: [
            { id: 1, name: "Elektronik 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Elektronik 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Elektronik 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 4,
        name: "Besi & Logam",
        Icon: FaDrumSteelpan,
        SubCategory: [
            { id: 1, name: "Besi & Logam 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Besi & Logam 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Besi & Logam 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 5,
        name: "Botol Kaca",
        Icon: FaDrumSteelpan,
        SubCategory: [
            { id: 1, name: "Botol Kaca 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Botol Kaca 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Botol Kaca 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 6,
        name: "Khusus",
        Icon: FaBiohazard,
        SubCategory: [
            { id: 1, name: "Khusus 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Khusus 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Khusus 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 7,
        name: "Makanan",
        Icon: MdFastfood,
        SubCategory: [
            { id: 1, name: "Makanan 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Makanan 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Makanan 3", imageUrl: "/images/dummy.png" }
        ]
    },
    {
        id: 8,
        name: "Kain",
        Icon: FaTshirt,
        SubCategory: [
            { id: 1, name: "Kain 1", imageUrl: "/images/dummy.png" },
            { id: 2, name: "Kain 2", imageUrl: "/images/dummy.png" },
            { id: 3, name: "Kain 3", imageUrl: "/images/dummy.png" }
        ]
    }
]

export default WasteTypes;