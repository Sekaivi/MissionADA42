import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
    {
        rules: {
            // Autorise les apostrophes et guillemets dans le JSX sans les échapper
            'react/no-unescaped-entities': 'off',
        },
    },
]);

export default eslintConfig;
