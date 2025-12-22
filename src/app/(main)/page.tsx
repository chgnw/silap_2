import Hero from '../components/Sections/Hero/Hero'

import Solusi from '../components/Sections/Solusi/Solusi'
import Service from '../components/Sections/ServicesSection/Service'
import WasteType from '../components/Sections/WasteType/WasteType'
import KelolaSampah from '../components/Sections/KelolaSampah/KelolaSampah'
import JoinUs from '../components/Sections/JoinUs/JoinUs'

import styles from './home.module.css'

import Image from 'next/image';

export default function Homepage() {
    return (
        <>
            <Hero />
            {/* TargetUser moved inside Hero */}
            <Solusi />
            <Service />
            <div className={styles.decoratedSectionWrapper}>
                {/* Dekorasi kiri (Polaroid) */}
                <Image
                    src="/images/polaroid.svg"
                    alt="Polaroid"
                    width={280}
                    height={280}
                    className={styles.decorationLeft}
                />

                {/* Dekorasi kanan (Cincin) */}
                <Image
                    src="/images/decoration-1.svg"
                    alt="Circle Ring"
                    width={380}
                    height={380}
                    className={styles.decorationRight}
                />
            </div>
            <WasteType />
            <KelolaSampah />
            <JoinUs />
        </>
    );
}