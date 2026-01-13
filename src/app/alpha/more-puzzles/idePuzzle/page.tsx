'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { CSSProperties } from 'react';

import { AnimatePresence } from 'framer-motion';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaWindow } from '@/components/alpha/AlphaWindow';

import './idePuzzle.css';

interface ThemeStyle {
    className: { bad: string; good: string };
    style: { bad: CSSProperties; good: CSSProperties };
}

type PageThemes = {
    [key: string]: ThemeStyle;
};

const page_images = {
    nyan: '/images/idePuzzle/nyan-cat-cat.gif',
    banner: '/images/idePuzzle/webdesignerparadise.gif',
    nerd: '/images/idePuzzle/nerd.gif',
    cool: '/images/idePuzzle/cool.png',
    sparkles: '/images/idePuzzle/sparkles.gif',
    trash: '/images/idePuzzle/trash.gif',
    notSupported: '/images/idePuzzle/notsupported.png',
    htmlClinic: '/images/idePuzzle/htmlclinic.gif',
    finalImg: '/images/idePuzzle/iut1_image.jpg',
    smiley: '/images/idePuzzle/smiley_lg_clr.gif',
};

// RÉPONSES ATTENDUES
const CORRECT_ANSWERS = {
    nyan: ['none'],
    h1Color: [
        'black',
        'noir',
        '#000000',
        '000',
        '#000',
        'rgb(0,0,0)',
        'rgba(0,0,0,1)',
        'pure black',
    ],
    pSize: ['12px'],
    bg: [
        'white',
        'blanc',
        '#ffffff',
        'fff',
        '#fff',
        'rgb(255,255,255)',
        'rgba(255,255,255,1)',
        'pure white',
    ],
    zIndex: ['-1'],
    marquee: ['none', 'paused'],
};

// La "moulinette" qui recrée la structure que tes composants attendent
const t = (
    badCl: string,
    goodCl: string = 'hidden',
    badSt: CSSProperties | null = null
): ThemeStyle => ({
    className: { bad: badCl, good: goodCl },
    style: {
        bad: badSt || {},
        good: badSt && 'animation' in badSt ? { animation: 'none' } : {},
    },
});

const page_themes: PageThemes = {
    nyancat: t('absolute top-0 left-0 w-[20rem] z-10'),
    h1: t(
        'text-red-500 bg-[#00FF15] p-4 w-fit shadow-[inset_10px_10px_6px_rgba(255,255,255,0.5)] rounded-[20%]',
        'text-black text-[24px] bg-transparent shadow-none rounded-none font-sans animate-none'
    ),
    p: t("font-['Festive',_cursive] text-[42px] text-[#3CFF00]", 'text-black text-[12px]'),
    websiteContent: t(
        'relative flex flex-col items-center gap-4 p-4 bg-[#00C8FF]',
        'relative flex flex-col items-center gap-4 p-4 bg-white rounded'
    ),
    imageCoverContainer: t('absolute inset-0 w-full h-full flex items-center justify-center'),
    marqueeContainer: t(
        'relative z-0 w-full bg-red-600 text-white font-bold text-[16px] py-[10px] overflow-hidden whitespace-nowrap box-border'
    ),
    fakeLink: t('font-serif text-purple-700 underline font-bold', 'text-black text-[12px]'),

    // Éléments avec du style spécifique (animation ou background)
    website: t(
        "font-['Comic_Sans_MS',_cursive] p-4 rounded-b-2xl bg-repeat bg-[length:100%_100%,25rem]",
        'p-4 rounded-b-2xl bg-white',
        {
            backgroundImage: `linear-gradient(to bottom, rgba(255,0,0,0.6), rgba(255,127,0,0.6), rgba(255,255,0,0.6), rgba(0,255,0,0.6), rgba(0,0,255,0.6), rgba(75,0,130,0.6), rgba(148,0,211,0.6)), url('/images/idePuzzle/iut1_image.jpg')`,
            backgroundRepeat: 'no-repeat, repeat',
        }
    ),
    marqueeContent: t('inline-block whitespace-nowrap', 'inline-block whitespace-nowrap', {
        animation: 'marquee 10s linear infinite',
    }),
    uglyCoolEmogi: t('w-full', 'w-full', { animation: 'shakyImage 0.3s infinite ease-in-out' }),
    top3: t('text-blue', 'text-black', {
        animation: 'blinkingTextAnim 0.5s steps(2, jump-none) infinite alternate',
    }),
};

// champs de l'IDE
const ide_fields = [
    {
        id: 'nyan', // il faut faire correspondre les id avec les chmps de CORRECT_ANSWERS
        comment: '/* Virer le chat qui bloque tout */',
        element: '#nyan-cat',
        attribut: 'display',
        placeholder: '--',
    },
    {
        id: 'h1Color',
        comment: '/* 1. Uniformiser les titres H1 */',
        element: 'h1',
        attribut: 'color',
        placeholder: 'blue',
    },
    {
        id: 'pSize',
        comment: '/* 2. Fixer les paragraphes */',
        element: 'p',
        attribut: 'font-size',
        placeholder: '16px',
    },
    {
        id: 'bg',
        comment: '/* 3. Couleur de fond du site */',
        element: '.fake-website-content',
        attribut: 'background-color',
        placeholder: 'cyan',
    },
    {
        id: 'zIndex',
        comment: '/* 3. Ajuster la profondeur pour voir le texte caché */',
        element: '.image-covering-container',
        attribut: 'z-index',
        placeholder: '999',
    },
    {
        id: 'marquee',
        comment: "/* 4. Stopper l'enfer du scroll */",
        element: '.marquee-content',
        attribut: 'animation',
        placeholder: '--',
    },
];

export default function Etap2Enigme2() {
    const [inputs, setInputs] = useState<Record<string, string>>({
        nyan: '',
        h1Color: '',
        pSize: '',
        bg: '',
        zIndex: '',
        marquee: '',
    });

    const [logs, setLogs] = useState<{ msg: string; type: 'error' | 'success' }[]>([]);

    const [isFixed, setIsFixed] = useState(false);

    const [activeWindow, setActiveWindow] = useState('website');

    const isCorrect = (id: string) => {
        const val = inputs[id]?.toLowerCase().trim();
        return CORRECT_ANSWERS[id as keyof typeof CORRECT_ANSWERS]?.includes(val);
    };

    // verification globale
    const handleExecute = () => {
        let errorsFound = 0;
        setLogs([]);

        Object.keys(CORRECT_ANSWERS).forEach((key) => {
            const userValue = inputs[key]?.toLowerCase().trim();
            const validOptions = CORRECT_ANSWERS[key as keyof typeof CORRECT_ANSWERS];

            if (!validOptions.includes(userValue)) {
                const fieldInfo = ide_fields.find((f) => f.id === key);
                addLog(
                    `Error: invalid value "${userValue || '--'}" for ${fieldInfo?.attribut} on ${fieldInfo?.element}`
                );
                errorsFound++;
            }
        });

        if (errorsFound === 0) {
            setIsFixed(true);
            setActiveWindow('website');
            addLog('Compilation successful! Project deployed.', 'success');
        }
    };

    const addLog = (message: string, type: 'error' | 'success' = 'error') => {
        setLogs((prev) => [{ msg: message, type }, ...prev].slice(0, 5)); // On garde les 5 derniers
    };

    const handleInputChange = (id: string, value: string) => {
        setInputs((prev) => ({ ...prev, [id]: value }));
    };

    // fonction qui permet de remplacer le style d'un élément
    const getThemeProps = (
        themeKey: keyof typeof page_themes,
        checkId?: keyof typeof CORRECT_ANSWERS | null
    ) => {
        const ok = isFixed || (checkId ? isCorrect(checkId) : false);
        const theme = page_themes[themeKey];
        return {
            className: ok ? theme.className.good : theme.className.bad,
            style: ok ? theme.style.good : theme.style.bad,
        };
    };

    return (
        <>
            <AlphaHeader
                title={'Du CSS de qualité'}
                subtitle={
                    'à vous de démontrer vos compétences de super développeur et améliorer ce site !'
                }
            />

            {/* VICTOIRE */}
            <AnimatePresence>
                {isFixed && <AlphaSuccess message={"C'est presque beau"} />}
            </AnimatePresence>

            {/* TOGGLE MENU pour passer du site à l'IDE */}
            {!isFixed && (
                <div className="items center flex w-full justify-center">
                    <label className="inline-flex cursor-pointer items-center">
                        <span className="text-heading text-sm font-medium select-none">Site</span>
                        <input
                            type="checkbox"
                            checked={activeWindow === 'ide'}
                            onChange={() =>
                                setActiveWindow(activeWindow === 'website' ? 'ide' : 'website')
                            }
                            value=""
                            className="peer sr-only"
                        />
                        {/* Remplace la div du visuel par celle-ci */}
                        <div className="bg-muted peer-focus:ring-border peer peer-checked:bg-brand-emerald relative mx-3 h-5 w-9 rounded-full peer-focus:ring-4 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                        <span className="text-heading text-sm font-medium select-none">Code</span>
                    </label>
                </div>
            )}

            {/* SECTION D'IDE */}
            {!isFixed && (
                <AlphaWindow title="style.css — Visual Studio Code" active={activeWindow === 'ide'}>
                    <div className="flex items-center justify-end gap-4 bg-sky-600 p-2">
                        <span className="text-xs tracking-widest text-white uppercase opacity-80">
                            UTF-8 | CSS
                        </span>

                        <button
                            onClick={() => {
                                handleExecute();
                            }}
                            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95"
                        >
                            <span className="text-xs">▶</span> RUN CODE
                        </button>
                    </div>

                    {/* --- ZONE DE CODE --- */}
                    <section className="relative overflow-y-auto p-6">
                        {ide_fields.map((field, index) => (
                            <div key={index} className="group flex">
                                {/* Numéros de ligne */}
                                <div className="text-muted w-8 pt-1 pr-4 text-right text-xs select-none">
                                    {index + 1}
                                </div>

                                <div className="mb-4">
                                    {/* Commentaire */}
                                    <div className="mb-1 text-sm text-[#6a9955] italic">
                                        {field.comment}
                                    </div>

                                    <div className="text-sm">
                                        {/* Sélecteur CSS */}
                                        <span className="text-brand-yellow">{field.element}</span>
                                        <span className="text-brand-yellow"> {'{'}</span>

                                        <div className="flex flex-wrap items-baseline py-1 pl-6">
                                            {/* Propriété */}
                                            <span className="text-sky-300">{field.attribut}</span>
                                            <span className="text-muted mx-1">:</span>

                                            {/* Input stylisé */}
                                            <input
                                                type={
                                                    field.attribut === 'z-index' ? 'number' : 'text'
                                                }
                                                value={inputs[field.id] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(field.id, e.target.value)
                                                }
                                                placeholder={field.placeholder}
                                                className="bg-surface-highlight text-brand-orange w-28 rounded border border-transparent px-2 transition-all outline-none focus:bg-[#37373d]"
                                            />
                                            <span className="text-muted">;</span>
                                        </div>

                                        <span className="text-brand-yellow">{'}'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* CONSOLE (TOGGLEABLE) */}
                    <div className="border-t border-white/10 bg-[#1e1e1e]">
                        <div className="bg-border flex w-full items-center justify-start gap-4 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                            <span className={'border-brand-blue border-b text-white'}>Output</span>
                            <span className="text-muted">Problems</span>
                        </div>

                        <div className="overflow-hidden px-4 font-mono text-xs">
                            <div className="min-h-32 py-2">
                                {logs.length === 0 ? (
                                    <p className="text-muted">En attente d'execution...</p>
                                ) : (
                                    logs.map((log, i) => (
                                        <div
                                            key={i}
                                            className={`mb-1 ${log.type === 'error' ? 'text-brand-error' : 'text-brand-emerald'}`}
                                        >
                                            <span className="opacity-40">
                                                [{new Date().toLocaleTimeString()}]{' '}
                                            </span>{' '}
                                            {log.msg}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </AlphaWindow>
            )}

            {/* SECTION SITE */}
            <AlphaWindow title="localhost:3000/monsupersite" active={activeWindow === 'website'}>
                {/* A AJUSTER POUR LA FIN DU JEU */}
                <div {...getThemeProps('website')}>
                    {/* fake page content */}
                    <div {...getThemeProps('websiteContent', 'bg')}>
                        <div className="relative flex w-full flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div {...getThemeProps('imageCoverContainer', 'zIndex')}>
                                    <img
                                        className="relative"
                                        src={page_images.banner}
                                        alt="web designer paradise"
                                    />
                                </div>
                                <h1 {...getThemeProps('h1', 'h1Color')}>
                                    Bienvenu o sin de lIUT1 de luniversiter grenobles alpe
                                </h1>
                                <img
                                    {...getThemeProps('nyancat', 'nyan')}
                                    src={page_images.nyan}
                                    alt="nyan cat !"
                                />
                            </div>

                            {/* marquee */}
                            <div {...getThemeProps('marqueeContainer', 'marquee')}>
                                {/* marquee-content */}
                                <div {...getThemeProps('marqueeContent', 'marquee')}>
                                    (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ PROMO EXCEPTIONNELLE SUR LE COMIC SANS MS ! ★彡
                                    DÉCOUVREZ LE NOUVEAU WORKFLOW AGILE ! ⤷ ゛ ˎˊ˗ OPTIMISATION
                                    EXCESSIVE DU SEO POUR VOTRE MINDSET ! (＾▽＾) PITCH TA VIE EN
                                    360° ! (｡˃ ᵕ ˂ )⸝♡ DESIGN SPRINT NO-CODE CETTE SEMAINE !
                                    APPRENDRE LE XHTML DANS 10 SECONDES TOP CHRONO ! ⋆˚꩜｡
                                </div>
                            </div>

                            {/* nerd emogi part */}
                            <div className="nowrap flex flex-row items-center justify-center gap-[2px]">
                                <img src={page_images.nerd} alt="nerd emogi en GIF" />
                                <p {...getThemeProps('p', 'pSize')}>J’aime tro le dev !!</p>
                            </div>

                            <h1 {...getThemeProps('h1', 'h1Color')}>Mon super site</h1>

                            <p {...getThemeProps('p', 'pSize')}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
                                eget lacus ac quam imperdiet faucibus. Maecenas gravida lacinia
                                nisl, ut vehicula ante tempus hendrerit. Etiam nibh mauris, posuere
                                et magna ac, dictum mattis erat. Fusce dapibus pretium euismod.
                                Curabitur dolor neque, condimentum facilisis sapien eu, tincidunt
                                facilisis neque. Aenean gravida porttitor risus, id consequat purus
                                facilisis eu. Maecenas gravida sed eros nec hendrerit.
                            </p>

                            {/* grid images */}
                            <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-[10px]">
                                <img
                                    {...getThemeProps('uglyCoolEmogi')}
                                    src={page_images.cool}
                                    alt="ugly cool emogi"
                                />
                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex h-full w-full items-center justify-center text-[42px]">
                                        <p
                                            {...getThemeProps('p', 'pSize')}
                                            className={`rotate-[10deg] ${getThemeProps('p', 'pSize').className}`}
                                        >
                                            Les étudiants en MMI
                                        </p>
                                    </div>
                                    <img
                                        className="absolute top-0"
                                        src={page_images.sparkles}
                                        alt="etincelles"
                                    />
                                    <img src={page_images.trash} alt="poubelle" />
                                </div>
                            </div>

                            <p {...getThemeProps('fakeLink')}>Ceci n'est pas un lien</p>

                            <div className="relative flex w-full flex-col items-center justify-center gap-4">
                                <div {...getThemeProps('imageCoverContainer', 'zIndex')}>
                                    <img src={page_images.smiley} alt="smiley GIF" />
                                </div>
                                <p {...getThemeProps('top3')}>Top 3 éléments html</p>
                                <ul className="text-black">
                                    <li>strike</li>
                                    <li>xmp</li>
                                    <li>basefont</li>
                                </ul>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-[6px]">
                                <img src={page_images.notSupported} alt="Error not supported" />
                                <img src={page_images.htmlClinic} alt="html click gif" />
                            </div>

                            <div className="flex h-full w-full flex-col items-center justify-center border border-solid border-gray-300 bg-white p-8 font-serif text-black">
                                <h2 className="my-4 text-[32px] font-bold">504 Gateway Time-out</h2>
                                <hr className="mb-4 w-full border-t border-gray-300" />
                                <p className="text-base italic">nginx/1.4.6 (Ubuntu)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </AlphaWindow>
        </>
    );
}
