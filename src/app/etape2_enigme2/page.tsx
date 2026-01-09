'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { CheckIcon } from '@heroicons/react/24/solid';

import Button from '@/components/ui/Button';
import AnimatedBackground from "@/components/ui/AnimatedBackground"; // pour l'ecran de fin quand c'est reussi ?


const page_images = {
    nyan: "/images/idePuzzle/nyan-cat-cat.gif",
    banner: "/images/idePuzzle/webdesignerparadise.gif",
    nerd: "/images/idePuzzle/nerd.gif",
    cool: "/images/idePuzzle/cool.png",
    sparkles: "/images/idePuzzle/sparkles.gif",
    trash: "/images/idePuzzle/trash.gif",
    notSupported: "/images/idePuzzle/notsupported.png",
    htmlClinic: "/images/idePuzzle/htmlclinic.gif",
    finalImg: "/images/idePuzzle/iut1_image.jpg",
    smiley: "/images/idePuzzle/smiley_lg_clr.gif"
};

// RÉPONSES ATTENDUES
const CORRECT_ANSWERS = {
    nyan: ["none"],
    h1Color: ["black", "noir", "#000000", "000", "#000", "rgb(0,0,0)", "rgba(0,0,0,1)", "pure black"],
    pSize: ["12px"],
    bg: ["white", "blanc", "#ffffff", "fff", "#fff", "rgb(255,255,255)", "rgba(255,255,255,1)", "pure white"],
    zIndex: ["-1"],
    marquee: ["none", "paused"]
};

// les styles à modifier ou plutot le faire par element... ? hmm
const page_themes = {
    nyancat: {
        className: {
            bad: "absolute top-0 left-0 w-[20rem] z-10",
            good: "hidden"
        }
    },
    h1: {
        className: {
            bad: "text-red-500 bg-[#00FF15] p-4 w-fit shadow-[inset_10px_10px_6px_rgba(255,255,255,0.5)] rounded-[20%]",
            good: "text-black text-[24px] bg-transparent shadow-none rounded-none font-sans animate-none"
        }
    },
    p: {
        className: {
            bad: "font-['Festive',_cursive] text-[42px] text-[#3CFF00]",
            good: ""
        }
    },
    website: {
        className: {
            bad: "font-['Comic_Sans_MS',_cursive] p-4 rounded-b-2xl bg-repeat bg-[length:100%_100%,25rem]",
            good: "p-4 rounded-b-2xl"
        },
        style: {
            bad: {
                backgroundImage: `linear-gradient(to bottom, rgba(255,0,0,0.6), rgba(255,127,0,0.6), rgba(255,255,0,0.6), rgba(0,255,0,0.6), rgba(0,0,255,0.6), rgba(75,0,130,0.6), rgba(148,0,211,0.6)), url('/images/idePuzzle/iut1_image.jpg')`,
                backgroundRepeat: 'no-repeat, repeat'
            },
            good: {}
        }
    },
    websiteContent: {
        className: {
            bad: "relative flex flex-col items-center gap-4 p-4 bg-[#00C8FF]",
            good: "relative flex flex-col items-center gap-4 p-4 bg-white rounded"
        }
    },
    imageCoverContainer: {
        className: {
            bad: "absolute inset-0 w-full h-full flex items-center justify-center",
            good: "hidden"
        }
    },
    marqueeContainer: {
        className: {
            bad: "relative z-0 w-full bg-red-600 text-white font-bold text-[16px] py-[10px] overflow-hidden whitespace-nowrap box-border",
            good: "hidden"
        }
    },
    marqueeContent: {
        className: {
            bad: "inline-block whitespace-nowrap",
            good: "inline-block whitespace-nowrap"
        },
        style: {
            bad: { animation: 'marquee 10s linear infinite' },
            good: { animation: 'none' }
        }
    },
    uglyCoolEmogi: {
        className: {
            bad: "w-full",
            good: "w-full",
        },
        style: {
            bad: { animation: "shakyImage 0.3s infinite ease-in-out" },
            good: { animation: "none" },
        }
    },
    fakeLink: {
        className: {
            bad: "font-serif text-purple-700 underline font-bold",
            good: "",
        }
    }


}

// champs de l'IDE
const ide_fields = [
    {
        id: "nyan", // il faut faire correspondre les id avec les chmps de CORRECT_ANSWERS
        comment: "/* Virer le chat qui bloque tout */",
        element: "#nyan-cat",
        attribut: "display",
        placeholder: "--"
    },
    {
        id: "h1Color",
        comment: "/* 1. Uniformiser les titres H1 */",
        element: "h1",
        attribut: "color",
        placeholder: "blue"
    },
    {
        id: "pSize",
        comment: "/* 2. Fixer les paragraphes */",
        element: "p",
        attribut: "font-size",
        placeholder: "16px"
    },
    {
        id: "bg",
        comment: "/* 3. Couleur de fond du site */",
        element: ".fake-website-content",
        attribut: "background-color",
        placeholder: "cyan"
    },
    {
        id: "zIndex",
        comment: "/* 3. Ajuster la profondeur pour voir le texte caché */",
        element: ".image-covering-container",
        attribut: "z-index",
        placeholder: "999"
    },
    {
        id: "marquee",
        comment: "/* 4. Stopper l'enfer du scroll */",
        element: ".marquee-content",
        attribut: "animation",
        placeholder: "--"
    }
];

const messagesHarry = [];

export default function Etap2Enigme2() {

    const [inputs, setInputs] = useState<Record<string, string>>({
        nyan: "",
        h1Color: "",
        pSize: "",
        bg: "",
        zIndex: "",
        marquee: ""
    });

    const [logs, setLogs] = useState<{ msg: string, type: 'error' | 'success' }[]>([]);

    const [isFixed, setIsFixed] = useState(false);

    const [isConsoleOpen, setIsConsoleOpen] = useState(true);

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
                const fieldInfo = ide_fields.find(f => f.id === key);
                addLog(`Error: invalid value "${userValue || '--'}" for ${fieldInfo?.attribut} on ${fieldInfo?.element}`);
                errorsFound++;
            }
        });

        if (errorsFound === 0) {
            setIsFixed(true);
            addLog("Compilation successful! Project deployed.", "success");
        }
    };

    const addLog = (message: string, type: 'error' | 'success' = 'error') => {
        setLogs(prev => [{ msg: message, type }, ...prev].slice(0, 5)); // On garde les 5 derniers
    };

    const handleInputChange = (id: string, value: string) => {
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const msgHarry = useRef<HTMLParagraphElement>(null);

    return (
        <>
            <main className="flex flex-col nowrap gap-4 bg-gray-50 px-4 py-6 md:py-10 text-black">

                {/* MESSAGE DE HARRY DLER */}
                <div className="max-w-md rounded-2xl bg-gradient-to-br from-purple-600/80 to-blue-600/80 p-4 shadow-lg backdrop-blur-md border border-white/20">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/70">
                        ANONYME
                    </p>
                    <p ref={msgHarry} id="content-msg" className="text-sm leading-relaxed text-white">
                        Vous êtes plutôt créatifs en MMI non ? Alors arrangez moi tout ça. Si vous aimez rigolez, croyez moi qu’on va rigoler
                    </p>
                </div>

                {/* SECTION SITE */}
                <section className='w-full'>
                    <div className="flex items-center justify-between gap-2 bg-[#2d2d2d] px-4 py-3 rounded-t-2xl border-b border-white/10 backdrop-blur-sm">
                        <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span>
                            <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                            <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">localhost:3000/preview</span>
                        <div></div>
                    </div>

                    {/* A AJUSTER POUR LA FIN DU JEU */}
                    <div
                        className={isFixed ? page_themes.website.className.good : page_themes.website.className.bad}
                        style={isFixed ? page_themes.website.style.good : page_themes.website.style.bad}
                    >
                        {/* fake page content */}
                        <div className={isCorrect('bg') || isFixed ? page_themes.websiteContent.className.good : page_themes.websiteContent.className.bad}>

                            <div className="relative w-full flex flex-col items-center justify-center gap-4">
                                <div className='relative'>
                                    <div className={isCorrect('zIndex') || isFixed ? page_themes.imageCoverContainer.className.good : page_themes.imageCoverContainer.className.bad}>
                                        <img className='relative' src={page_images.banner} />
                                    </div>
                                    <h1 className={isCorrect('h1Color') || isFixed ? page_themes.h1.className.good : page_themes.h1.className.bad}>Bienvenu o sin de lIUT1 de luniversiter grenobles alpe</h1>
                                    <img className={isCorrect('nyan') || isFixed ? page_themes.nyancat.className.good : page_themes.nyancat.className.bad} src={page_images.nyan} alt="nyan cat !" />
                                </div>

                                {/* marquee */}
                                <div className={isCorrect('marquee') || isFixed ? page_themes.marqueeContainer.className.good : page_themes.marqueeContainer.className.bad}>
                                    {/* marquee-content */}
                                    <div className={isCorrect('marquee') || isFixed ? page_themes.marqueeContent.className.good : page_themes.marqueeContent.className.bad}
                                        style={isCorrect('marquee') || isFixed ? page_themes.marqueeContent.style.good : page_themes.marqueeContent.style.bad} >
                                        (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ PROMO EXCEPTIONNELLE SUR LE COMIC SANS MS ! ★彡 DÉCOUVREZ LE NOUVEAU WORKFLOW AGILE ! ⤷ ゛ ˎˊ˗ OPTIMISATION
                                        EXCESSIVE DU SEO POUR VOTRE MINDSET ! (＾▽＾) PITCH TA VIE EN 360° ! (｡˃ ᵕ ˂ )⸝♡ DESIGN SPRINT
                                        NO-CODE CETTE SEMAINE ! APPRENDRE LE XHTML DANS 10 SECONDES TOP CHRONO ! ⋆˚꩜｡
                                    </div>
                                </div>

                                {/* nerd emogi part */}
                                <div className='flex flex-row nowrap gap-[2px] items-center justify-center'>
                                    <img src={page_images.nerd} alt="nerd emogi en GIF" />
                                    <p className={isCorrect('pSize') || isFixed ? page_themes.p.className.good : page_themes.p.className.bad}>J’aime tro le dev !!</p>
                                </div>

                                <h1 className={isCorrect('h1Color') || isFixed ? page_themes.h1.className.good : page_themes.h1.className.bad}>Mon super site</h1>

                                <p className={isCorrect('pSize') || isFixed ? page_themes.p.className.good : page_themes.p.className.bad}>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget lacus ac
                                    quam imperdiet
                                    faucibus. Maecenas gravida lacinia nisl, ut vehicula ante tempus hendrerit. Etiam nibh mauris,
                                    posuere
                                    et magna ac, dictum mattis erat. Fusce dapibus pretium euismod. Curabitur dolor neque, condimentum
                                    facilisis sapien eu, tincidunt facilisis neque. Aenean gravida porttitor risus, id consequat purus
                                    facilisis eu. Maecenas gravida sed eros nec hendrerit.
                                </p>

                                {/* grid images */}
                                <div className='grid grid-cols-2 grid-rows-[auto_auto] gap-[10px]'>
                                    <img className={isFixed ? page_themes.uglyCoolEmogi.className.good : page_themes.uglyCoolEmogi.className.bad}
                                        style={isFixed ? page_themes.uglyCoolEmogi.style.good : page_themes.uglyCoolEmogi.style.bad}
                                        src={page_images.cool} alt="ugly cool emogi" />
                                    <div className='w-full relative'>
                                        <div className='absolute inset-0 w-full h-full flex items-center justify-center text-[42px]'>
                                            <p className={`rotate-[10deg] ${isCorrect('pSize') || isFixed ? page_themes.p.className.good : page_themes.p.className.bad}`}>
                                                Les étudiants en MMI</p>
                                        </div>
                                        <img className='absolute top-0' src={page_images.sparkles} alt="etincelles" />
                                        <img src={page_images.trash} alt="poubelle" />
                                    </div>
                                </div>

                                <p className={isCorrect('pSize') || isFixed ? page_themes.fakeLink.className.good : page_themes.fakeLink.className.bad}
                                >Ceci n'est pas un lien</p>

                                <div className="relative w-full flex flex-col items-center justify-center gap-4">
                                    <div className={isCorrect('zIndex') || isFixed ? page_themes.imageCoverContainer.className.good : page_themes.imageCoverContainer.className.bad}>
                                        <img src={page_images.smiley} alt="smiley GIF" />
                                    </div>
                                    <p className='text-blue' style={{ animation: "blinkingTextAnim 0.5s steps(2, jump-none) infinite alternate" }}>Top 3 éléments html</p>
                                    <ul>
                                        <li>strike</li>
                                        <li>xmp</li>
                                        <li>basefont</li>
                                    </ul>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-[6px]">
                                    <img src={page_images.notSupported} alt="Error not supported" />
                                    <img src={page_images.htmlClinic} alt="html click gif" />
                                </div>

                                <div className="border border-solid border-gray-300 flex flex-col items-center justify-center w-full h-full bg-white p-8 font-serif text-black">
                                    <h2 className="text-[32px] font-bold my-4">504 Gateway Time-out</h2>
                                    <hr className="w-full border-t border-gray-300 mb-4" />
                                    <p className="text-base italic">nginx/1.4.6 (Ubuntu)</p>
                                </div>

                            </div>
                        </div>

                    </div>
                </section>

                {/* SECTION D'IDE */}
                <AnimatePresence>
                    {!isFixed && (
                        <motion.section
                            exit={{ x: 100, opacity: 0 }}
                            className="w-full mx-auto font-mono shadow-2xl overflow-hidden rounded-lg border border-gray-700 bg-[#1e1e1e] text-gray-300"
                        >
                            {/* --- BARRE DE TITRE STYLE MAC --- */}
                            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <span className="text-xs text-gray-500">style.css — Visual Studio Code</span>
                                <div className="w-12"></div>
                            </div>

                            {/* --- FOOTER / BOUTON EXECUTE --- */}
                            <div className="bg-[#007acc] p-2 flex justify-end items-center gap-4">
                                <span className="text-[10px] text-white opacity-80 uppercase tracking-widest">UTF-8 | CSS</span>
                                <button
                                    onClick={() => {setIsFixed(true)}}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-800 text-white text-xs font-bold py-2 px-4 rounded transition-colors shadow-sm active:scale-95"
                                >
                                    <span className="text-[10px]">▶</span> RUN CODE
                                </button>
                            </div>

                            {/* --- ZONE DE CODE --- */}
                            <section className="p-6 relative">
                                {ide_fields.map((field, index) => (
                                    <div key={index} className="flex group">
                                        {/* Numéros de ligne */}
                                        <div className="w-8 text-gray-600 text-right pr-4 select-none pt-1 text-xs">
                                            {index + 1}
                                        </div>

                                        <div className="mb-4">
                                            {/* Commentaire */}
                                            <div className="text-[#6a9955] italic text-sm mb-1">{field.comment}</div>

                                            <div className="text-sm">
                                                {/* Sélecteur CSS */}
                                                <span className="text-[#d7ba7d]">{field.element}</span>
                                                <span className="text-[#ffd700]"> {"{"}</span>

                                                <div className="pl-6 py-1 flex items-baseline flex-wrap">
                                                    {/* Propriété */}
                                                    <span className="text-[#9cdcfe]">{field.attribut}</span>
                                                    <span className="text-gray-300 mx-1">:</span>

                                                    {/* Input stylisé */}
                                                    <input
                                                        type={field.attribut === 'z-index' ? 'number' : 'text'}
                                                        value={inputs[field.id] || ""}
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="bg-[#2d2d2d] text-[#ce9178] border border-transparent focus:border-[#3e3e3e] focus:bg-[#37373d] outline-none px-2 rounded w-28 transition-all"
                                                    />
                                                    <span className="text-gray-300">;</span>
                                                </div>

                                                <span className="text-[#ffd700]">{"}"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            {/* CONSOLE (TOGGLEABLE) */}
                            <div className="bg-[#1e1e1e] border-t border-white/10">
                                <button
                                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                                    className="w-full flex items-center justify-between px-4 py-1.5 bg-[#252526] hover:bg-[#2a2d2e] transition-colors"
                                >
                                    <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
                                        <span className={isConsoleOpen ? "text-white border-b border-blue-500" : "text-gray-500"}>Output</span>
                                        <span className="text-gray-500">Problems</span>
                                    </div>
                                    <span className="text-xs">{isConsoleOpen ? '▼' : '▲'}</span>
                                </button>

                                <motion.div
                                    initial={false}
                                    animate={{ height: isConsoleOpen ? 120 : 0 }}
                                    className="overflow-hidden font-mono text-[11px] px-4"
                                >
                                    <div className="py-2">
                                        {logs.length === 0 ? (
                                            <p className="text-gray-600">Waiting for compilation...</p>
                                        ) : (
                                            logs.map((log, i) => (
                                                <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span> {log.msg}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>


                {/* VICTOIRE - LIGHT VERSION */}
                <AnimatePresence>
                    {isFixed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/30 backdrop-blur-[2px] pointer-events-none"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white/90 p-8 rounded-3xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center pointer-events-auto max-w-sm w-full mx-4"
                            >
                                {/* Icône avec dégradé Blue-Green */}
                                <div className="w-20 h-20 p-4 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
                                    <CheckIcon className="w-full text-white"/>
                                </div>

                                <h2 className="text-2xl font-bold mb-2 text-slate-800 tracking-tight">
                                    Ok ça passe
                                </h2>

                                <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">
                                    Je trouve ça presque beau...
                                </p>

                                {/* Bouton stylisé Bleu/Vert */}
                                <button
                                    onClick={() => window.location.href = '/next-step'}
                                    className="w-full py-4 px-6 bg-gradient-to-br from-purple-600/80 to-blue-600/80 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                                >
                                    La suite ?
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main >

            {/* ANIMATION CSS CUSTOM */}
            < style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Festive&display=swap');

                @keyframes blinkingTextAnim {
                from {
                    color: red;
                }
                to {
                    color: #00FF15;
                }
            }

        @keyframes marquee {
            0% { transform: translateX(100%%); }
            100% { transform: translateX(-100%); }
        }

                @keyframes shakyImage {
      0% {transform: translate(0, 0) rotate(0deg);}
    /* État initial */
    10% {transform: translate(-1px, -1px) rotate(-0.5deg);}
    20% {xtransform: translate(1px, 1px) rotate(0.5deg);x}
    30% {transform: translate(-1px, 1px) rotate(0deg);}
    40% {transform: translate(1px, -1px) rotate(-0.5deg);}
    50% {transform: translate(-1px, 0px) rotate(0.5deg);}
    60% {transform: translate(0px, 1px) rotate(0deg);}
    70% {transform: translate(1px, -1px) rotate(-0.5deg);}
    80% {transform: translate(-1px, -1px) rotate(0.5deg);}
    90% { transform: translate(0px, 1px) rotate(0deg);}
    100% {transform: translate(0, 0) rotate(0deg);}
    }
        `}
            } />
        </>
    )
}