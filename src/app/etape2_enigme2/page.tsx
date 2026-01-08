'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

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
        bad: {
            className: "font-['Comic_Sans_MS',_cursive] p-4 rounded-b-2xl bg-repeat bg-[length:100%_100%,25rem]",
            style: {
                backgroundImage: `linear-gradient(to bottom, rgba(255,0,0,0.6), rgba(255,127,0,0.6), rgba(255,255,0,0.6), rgba(0,255,0,0.6), rgba(0,0,255,0.6), rgba(75,0,130,0.6), rgba(148,0,211,0.6)), url('/images/idePuzzle/iut1_image.jpg')`,
                backgroundRepeat: 'no-repeat, repeat'
            }
        }
    },
    websiteContent: {
        className: {
            bad: "relative flex flex-col items-center gap-4 p-4 bg-[#00C8FF]",
            good: ""
        }
    },
    imageCoverContainer: {
        className: {
            bad: "absolute inset-0 w-full h-full flex items-center justify-center",
            good: ""
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
            bad: "font-serif text-purple-700 underline font-bold"
        }
    }


}

const messagesHarry = [];

export default function Etap2Enigme2() {

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
                    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-t-2xl border-b border-white/10 backdrop-blur-sm">
                        <div className="flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span>
                            <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                            <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                        </div>
                    </div>

                    {/* A AJUSTER POUR LA FIN DU JEU */}
                    <div
                        className={page_themes.website.bad.className}
                        style={page_themes.website.bad.style}
                    >
                        {/* fake page content */}
                        <div className={page_themes.websiteContent.className.bad}>

                            <div className="relative w-full flex flex-col items-center justify-center gap-4">
                                <div className='relative'>
                                    <div className={page_themes.imageCoverContainer.className.bad}>
                                        <img className='relative' src={page_images.banner} />
                                    </div>
                                    <h1 className={page_themes.h1.className.bad}>Bienvenu o sin de lIUT1 de luniversiter grenobles alpe</h1>
                                    <img className={page_themes.nyancat.className.bad} src={page_images.nyan} alt="nyan cat !" />
                                </div>

                                {/* marquee */}
                                <div className={page_themes.marqueeContainer.className.bad}>
                                    {/* marquee-content */}
                                    <div className={page_themes.marqueeContent.className.bad} style={page_themes.marqueeContent.style.bad} >
                                        (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ PROMO EXCEPTIONNELLE SUR LE COMIC SANS MS ! ★彡 DÉCOUVREZ LE NOUVEAU WORKFLOW AGILE ! ⤷ ゛ ˎˊ˗ OPTIMISATION
                                        EXCESSIVE DU SEO POUR VOTRE MINDSET ! (＾▽＾) PITCH TA VIE EN 360° ! (｡˃ ᵕ ˂ )⸝♡ DESIGN SPRINT
                                        NO-CODE CETTE SEMAINE ! APPRENDRE LE XHTML DANS 10 SECONDES TOP CHRONO ! ⋆˚꩜｡
                                    </div>
                                </div>

                                {/* nerd emogi part */}
                                <div className='flex flex-row nowrap gap-[2px] items-center justify-center'>
                                    <img src={page_images.nerd} alt="nerd emogi en GIF" />
                                    <p className={page_themes.p.className.bad}>J’aime tro le dev !!</p>
                                </div>

                                <h1 className={page_themes.h1.className.bad}>Mon super site</h1>

                                <p className={page_themes.p.className.bad}>
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
                                    <img className={page_themes.uglyCoolEmogi.className.bad} style={page_themes.uglyCoolEmogi.style.bad} src={page_images.cool} alt="ugly cool emogi" />
                                    <div className='w-full relative'>
                                        <div className='absolute inset-0 w-full h-full flex items-center justify-center text-[42px]'>
                                            <p className={"rotate-[10deg]" + page_themes.p.className.bad}>Les étudiants en MMI</p>
                                        </div>
                                        <img className='absolute top-0' src={page_images.sparkles} alt="etincelles" />
                                        <img src={page_images.trash} alt="poubelle" />
                                    </div>
                                </div>

                                <p className={page_themes.fakeLink.className.bad}>Ceci n'est pas un lien</p>

                                <div className="relative w-full flex flex-col items-center justify-center gap-4">
                                    <div className={page_themes.imageCoverContainer.className.bad}>
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
            </main>

            {/* ANIMATION CSS CUSTOM */}
            <style dangerouslySetInnerHTML={{
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
        `}} />
        </>
    )
}