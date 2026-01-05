import Link from 'next/link';

export default function AlphaHome() {
    return (
        <>
            <h1>Page Alpha</h1>
            <p>Liste des pages avec les versions alpha des puzzle</p>

            <ul>
                <li>
                    <Link href={'/alpha/camera-only'}>Camera only test</Link>
                </li>
                <li>
                    <Link href={'/alpha/color-camera-test'}>Color camera test</Link>
                </li>
                <li>
                    {'=>'} <Link href={'/alpha/color-game'}>Color game test</Link>
                </li>
            </ul>
        </>
    );
}
