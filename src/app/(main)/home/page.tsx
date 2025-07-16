import Hero from '../../components/Sections/Hero/Hero'
import TargetUser from '../../components/Sections/TargetUser/TargetUser'
import Solusi from '../../components/Sections/Solusi/Solusi'
import Service from '../../components/Sections/ServicesSection/Service'


export default function Homepage() {
    return(
        <>
            <Hero />
            <TargetUser />
            <Solusi />
            <Service />
        </>
    );
}