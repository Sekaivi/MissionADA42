'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useState } from 'react';

import { PlayIcon } from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaWindow } from '@/components/alpha/AlphaWindow';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';

type PuzzleFieldId = 'nyan' | 'h1Color' | 'pSize' | 'bg' | 'zIndex' | 'marquee';

interface PuzzleFieldConfig {
    id: PuzzleFieldId;
    selector: string;
    property: string;
    placeholder: string;
    comment: string;
    inputType?: 'text' | 'number';
    correctValues: string[];
}

const PUZZLE_CONFIG: PuzzleFieldConfig[] = [
    {
        id: 'nyan',
        comment: '/* Virer le chat qui bloque tout */',
        selector: '#nyan-cat',
        property: 'display',
        placeholder: '--',
        correctValues: ['none'],
    },
    {
        id: 'h1Color',
        comment: '/* Uniformiser les titres H1 */',
        selector: 'h1',
        property: 'color',
        placeholder: 'blue',
        correctValues: ['black', 'noir', '#000000', '000', '#000', 'rgb(0,0,0)', 'pure black'],
    },
    {
        id: 'pSize',
        comment: '/* Fixer les paragraphes */',
        selector: 'p',
        property: 'font-size',
        placeholder: '16px',
        correctValues: ['12px'],
    },
    {
        id: 'bg',
        comment: '/* Couleur de fond du site */',
        selector: '.content',
        property: 'background-color',
        placeholder: 'cyan',
        correctValues: [
            'white',
            'blanc',
            '#ffffff',
            'fff',
            '#fff',
            'rgb(255,255,255)',
            'pure white',
        ],
    },
    {
        id: 'zIndex',
        comment: '/* Ajuster la profondeur pour voir le texte caché par la poubelle */',
        selector: '.bad-image',
        property: 'z-index',
        placeholder: '999',
        inputType: 'number',
        correctValues: ['-1'],
    },
    {
        id: 'marquee',
        comment: "/* Stopper l'enfer du texte défilant */",
        selector: '.very-annoying-text',
        property: 'animation',
        placeholder: '--',
        correctValues: ['none', 'paused'],
    },
];

const IMAGES = {
    nyan: '/images/idePuzzle/nyan-cat-cat.gif',
    banner: '/images/idePuzzle/webdesignerparadise.gif',
    nerd: '/images/idePuzzle/nerd.gif',
    cool: '/images/idePuzzle/cool.png',
    sparkles: '/images/idePuzzle/sparkles.gif',
    trash: '/images/idePuzzle/trash.gif',
    notSupported: '/images/idePuzzle/notsupported.png',
    htmlClinic: '/images/idePuzzle/htmlclinic.gif',
    smiley: '/images/idePuzzle/smiley_lg_clr.gif',
};

export type IdePuzzlePhases = PuzzlePhases | PuzzleFieldId | 'regression' | 'refix';

const usePuzzleLogic = () => {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [logs, setLogs] = useState<{ msg: string; type: 'error' | 'success' }[]>([]);
    const [activeWindow, setActiveWindow] = useState<'website' | 'ide'>('website');

    const [currentlySolved, setCurrentlySolved] = useState<PuzzleFieldId[]>([]);
    const [everSolvedHistory, setEverSolvedHistory] = useState<PuzzleFieldId[]>([]);
    const [dialogueTrigger, setDialogueTrigger] = useState<string | null>(null);

    const handleInputChange = (id: string, value: string) => {
        setInputs((prev) => ({ ...prev, [id]: value }));
    };

    const handleExecute = () => {
        let errorsFound = 0;
        setLogs([]);
        setDialogueTrigger(null);

        const validFieldsNow: PuzzleFieldId[] = [];

        PUZZLE_CONFIG.forEach((field) => {
            const userValue = inputs[field.id]?.toLowerCase().trim() || '';
            const isValid = field.correctValues.includes(userValue);

            if (isValid) {
                validFieldsNow.push(field.id);
            } else {
                setLogs((prev) =>
                    [
                        {
                            msg: `Error: invalid value "${userValue || '--'}" for ${field.property}`,
                            type: 'error' as const,
                        },
                        ...prev,
                    ].slice(0, 5)
                );
                errorsFound++;
            }
        });

        const brandNewSolves = validFieldsNow.filter((id) => !everSolvedHistory.includes(id));
        const regressions = currentlySolved.filter((id) => !validFieldsNow.includes(id));
        const reFixes = validFieldsNow.filter(
            (id) => everSolvedHistory.includes(id) && !currentlySolved.includes(id)
        );

        if (brandNewSolves.length > 0) {
            setDialogueTrigger(brandNewSolves[0]);
            setLogs((prev) => [
                { msg: 'Patch applied successfully.', type: 'success' as const },
                ...prev,
            ]);
        } else if (regressions.length > 0) {
            setDialogueTrigger('regression');
        } else if (reFixes.length > 0) {
            setDialogueTrigger('refix');
            setLogs((prev) => [{ msg: 'Fix restored.', type: 'success' as const }, ...prev]);
        } else if (errorsFound === 0 && validFieldsNow.length === currentlySolved.length) {
            setLogs((prev) => [{ msg: 'Code is stable.', type: 'success' as const }, ...prev]);
        }

        setCurrentlySolved(validFieldsNow);
        if (brandNewSolves.length > 0) {
            setEverSolvedHistory((prev) => [...prev, ...brandNewSolves]);
        }

        if (validFieldsNow.length === PUZZLE_CONFIG.length && errorsFound === 0) {
            setActiveWindow('website');
            setLogs((prev) => [
                { msg: 'Project fully deployed!', type: 'success' as const },
                ...prev,
            ]);
        } else if (errorsFound === 0) {
            setActiveWindow('website');
        }
    };

    const isFixed = PUZZLE_CONFIG.length > 0 && currentlySolved.length === PUZZLE_CONFIG.length;
    const validationStatus = useMemo(() => {
        const status: Record<string, boolean> = {};
        PUZZLE_CONFIG.forEach((field) => {
            status[field.id] = currentlySolved.includes(field.id);
        });
        return status;
    }, [currentlySolved]);

    return {
        inputs,
        logs,
        isFixed,
        activeWindow,
        setActiveWindow,
        handleInputChange,
        handleExecute,
        validationStatus,
        dialogueTrigger,
    };
};

interface IdeWindowProps {
    active: boolean;
    inputs: Record<string, string>;
    logs: { msg: string; type: 'error' | 'success' }[];
    onRun: () => void;
    onChange: (id: string, val: string) => void;
}

const IdeWindow = ({ active, inputs, logs, onRun, onChange }: IdeWindowProps) => (
    <AlphaWindow title="style.css — Visual Studio Code" active={active}>
        <section className="px-2 py-4">
            {PUZZLE_CONFIG.map((field) => (
                <div key={field.id} className="not-last:mb-4">
                    <div className="text-brand-emerald mb-1 text-sm italic">{field.comment}</div>
                    <div className="text-sm">
                        <span className="text-brand-yellow">{field.selector}</span>
                        <span className="text-brand-yellow"> {'{'}</span>
                        <div className="flex flex-wrap items-baseline py-1 pl-6">
                            <span className="text-sky-300">{field.property}</span>
                            <span className="text-muted mx-1">:</span>
                            <input
                                type={field.inputType || 'text'}
                                value={inputs[field.id] || ''}
                                onChange={(e) => onChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-surface-highlight text-brand-orange w-28 rounded border border-transparent px-2 transition-all outline-none focus:bg-[#37373d]"
                            />
                            <span className="text-muted">;</span>
                        </div>
                        <span className="text-brand-yellow">{'}'}</span>
                    </div>
                </div>
            ))}
        </section>

        <AlphaButton onClick={onRun} variant={'primary'} size={'md'} className={'mx-auto mb-4'}>
            <PlayIcon className={'mr-1 h-5 w-5'} /> RUN CODE
        </AlphaButton>

        <div className="bg-surface">
            <div className="bg-border">
                <p className="border-brand-blue border-b p-2 text-xs font-bold text-white">
                    Output
                </p>
            </div>
            <div className="min-h-32 p-2 font-mono text-xs">
                {logs.length === 0 ? (
                    <p className="text-muted">En attente d'execution...</p>
                ) : (
                    logs.map((log, i) => (
                        <div
                            key={i}
                            className={`mb-1 ${log.type === 'error' ? 'text-brand-error' : 'text-brand-emerald'}`}
                        >
                            <span className="opacity-40">[{new Date().toLocaleTimeString()}] </span>{' '}
                            {log.msg}
                        </div>
                    ))
                )}
            </div>
        </div>
    </AlphaWindow>
);

const WebsiteWindow = ({
    active,
    validationStatus,
}: {
    active: boolean;
    validationStatus: Record<string, boolean>;
}) => {
    const cx = (cond: boolean, ok: string, ko: string) => (cond ? ok : ko);

    const okH1 = validationStatus['h1Color'];
    const okP = validationStatus['pSize'];
    const okMarquee = validationStatus['marquee'];
    const okBg = validationStatus['bg'];

    return (
        <AlphaWindow title="localhost:3000/monsupersite" active={active}>
            {/* BACKGROUND GÉNÉRAL DU SITE */}
            <div
                className={cx(
                    okBg,
                    "h-full bg-white font-['Comic_Sans_MS',_cursive]",
                    'h-full bg-[#00C8FF]'
                )}
                style={
                    !okBg
                        ? {
                              backgroundImage: `linear-gradient(to bottom, rgba(255,0,0,0.6), rgba(0,0,255,0.6)), url('/images/idePuzzle/iut1_image.jpg')`,
                              backgroundSize: '100% 100%, 25rem',
                          }
                        : {}
                }
            >
                {/* CONTENEUR PRINCIPAL */}
                <div
                    className={cx(
                        okBg,
                        'relative flex flex-col items-center gap-4 p-4',
                        'relative flex flex-col items-center gap-4 p-4'
                    )}
                >
                    {/* EN-TÊTE + NYAN CAT */}
                    <div className="relative text-center">
                        <h2 className={cx(okH1, 'text-black', 'text-brand-purple')}>
                            Bienvenue au sein de l'IUT1 de l'Université Grenoble Alpes
                        </h2>

                        {/* NYAN CAT (Display: None) */}
                        {!validationStatus['nyan'] && (
                            <img
                                src={IMAGES.nyan}
                                alt="nyan cat"
                                className="absolute top-0 left-0 z-30 w-[20rem]"
                            />
                        )}
                    </div>

                    {/* MARQUEE */}
                    <div
                        className={cx(
                            okMarquee,
                            'w-full rounded bg-gray-100 py-2 text-center text-xs text-gray-500',
                            'w-full overflow-hidden bg-red-600 py-[10px] text-[16px] font-bold whitespace-nowrap text-white'
                        )}
                    >
                        <div
                            className={cx(
                                okMarquee,
                                'inline-block whitespace-nowrap',
                                'animate-marquee'
                            )}
                        >
                            {okMarquee
                                ? 'Actualités : Pas de nouvelle bonne nouvelle !'
                                : '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ PROMO EXCEPTIONNELLE SUR LE COMIC SANS MS ! ★彡 OPTIMISATION EXCESSIVE DU SEO ! (＾▽＾) PITCH TA VIE EN 360° ! (｡˃ ᵕ ˂ )⸝♡'}
                        </div>
                    </div>

                    {/* NERD EMOJI */}
                    <div className="flex items-center justify-center gap-2">
                        <img src={IMAGES.nerd} alt="nerd" className="h-8 w-8" />
                        <p
                            className={cx(
                                okP,
                                'text-[12px] text-black',
                                "font-['Festive',_cursive] text-[42px] text-[#3CFF00]"
                            )}
                        >
                            Branchez-vous dev l'équipe !
                        </p>
                    </div>

                    {/* GRILLE IMAGES MOCHES */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <img
                            src={IMAGES.trash}
                            alt="trash"
                            className={cx(
                                validationStatus['zIndex'],
                                'hidden',
                                'relative z-50 w-56'
                            )}
                        />
                    </div>

                    {/* CONTENU TEXTE */}
                    <h2 className={cx(okH1, 'text-black', 'text-brand-purple')}>
                        Présentation de MMI (pas du tout récupérée sur le site de l'UGA)
                    </h2>
                    <p
                        className={cx(
                            okP,
                            'max-w-prose text-sm text-gray-700',
                            "font-['Festive',_cursive] text-[24px] text-[#3CFF00]"
                        )}
                    >
                        Le Bachelor Universitaire de Technologie Métiers du Multimédia et de
                        l\'Internet (BUT MMI) est une formation en 3 ans, reconnue par l'Etat et les
                        entreprises. Le diplôme valant grade de licence professionnelle
                        universitaire (Bac+3) permet autant une insertion professionnelle qu'une
                        poursuite d'études (Bac+4/5).
                    </p>

                    {/* LIEN / FOOTER */}
                    <p
                        className={cx(
                            okP,
                            'cursor-pointer text-xs text-blue-500 underline',
                            'font-serif text-2xl font-bold text-purple-700 underline'
                        )}
                    >
                        <a target={'_blank'} href="https://jobs.gremmi.fr">
                            Ce lien renvoie vers votre futur site préféré ;)
                        </a>
                    </p>
                </div>
            </div>
        </AlphaWindow>
    );
};

export default function IdePuzzle({ isSolved, onSolve, scripts = {} }: PuzzleProps) {
    const {
        inputs,
        logs,
        isFixed,
        activeWindow,
        setActiveWindow,
        handleInputChange,
        handleExecute,
        validationStatus,
        dialogueTrigger,
    } = usePuzzleLogic();
    const { gameState, isDialogueOpen, currentScript, onDialogueComplete, triggerPhase } =
        useGameScenario<IdePuzzlePhases>(scripts);

    useEffect(() => {
        if (dialogueTrigger && dialogueTrigger in scripts) {
            triggerPhase(dialogueTrigger as IdePuzzlePhases);
        }
    }, [dialogueTrigger, triggerPhase, scripts]);

    // gestion de la victoire
    useEffect(() => {
        // lance 'win' si aucun dialogue intermédiaire n'est prévu
        // Si 'dialogueTrigger' => on laisse le useEffect le lancer.
        // Sinon => direct win
        const hasPendingDialogue = dialogueTrigger && dialogueTrigger in scripts;

        if (isFixed && !hasPendingDialogue) {
            triggerPhase('win');
        }
    }, [isFixed, triggerPhase, dialogueTrigger, scripts]);

    const handleDialogueComplete = () => {
        onDialogueComplete(); // Ferme le dialogue actuel

        // Si tout est réparé (isFixed) et qu'on vient de fermer un dialogue qui n'était PAS le dialogue de victoire
        // Alors on lance la victoire maintenant.
        if (isFixed && gameState !== 'win') {
            triggerPhase('win');
        }
    };

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => {
            triggerPhase('intro');
        },
        win: () => {
            setTimeout(() => {
                onSolve();
            }, SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'Puzzle résolu avec succès'} />;

    return (
        <>
            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={handleDialogueComplete}
            />

            <AnimatePresence>
                {isFixed && <AlphaSuccess message={"C'est bien mieux comme ça !"} />}
            </AnimatePresence>

            {!isFixed && (
                <div className={'flex justify-center'}>
                    <label className="inline-flex cursor-pointer items-center">
                        <span className="text-sm">Site</span>
                        <input
                            type="checkbox"
                            checked={activeWindow === 'ide'}
                            onChange={() =>
                                setActiveWindow(activeWindow === 'website' ? 'ide' : 'website')
                            }
                            className="peer sr-only"
                        />
                        <div className="bg-muted peer-focus:ring-border peer peer-checked:bg-brand-emerald relative mx-3 h-5 w-9 rounded-full peer-focus:ring-4 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                        <span className="text-sm">Code</span>
                    </label>
                </div>
            )}

            {!isFixed && (
                <IdeWindow
                    active={activeWindow === 'ide'}
                    inputs={inputs}
                    logs={logs}
                    onChange={handleInputChange}
                    onRun={handleExecute}
                />
            )}
            <WebsiteWindow
                active={activeWindow === 'website'}
                validationStatus={validationStatus}
            />
        </>
    );
}
