import Link from 'next/link';

import { ArrowTurnDownRightIcon } from '@heroicons/react/24/solid';

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
                <li className={'flex items-end gap-2'}>
                    <ArrowTurnDownRightIcon className={'h-8'} />{' '}
                    <Link href={'/alpha/color-game'}>Color game test</Link>
                </li>
            </ul>

            <ul>
                <li>
                    <Link href={'/alpha/orientation-debug'}>Orientation debug</Link>
                </li>
                <li className={'flex items-end gap-2'}>
                    <ArrowTurnDownRightIcon className={'h-8'} />{' '}
                    <Link href={'/alpha/orientation-game'}>Orientation debug</Link>
                </li>
            </ul>
        </>
    );
}
