'use client';

import { useSyncExternalStore } from 'react';

// souscription vide car l'état "être sur le client" ne change pas une fois monté
const subscribe = () => () => {};

export function useIsClient() {
    return useSyncExternalStore(
        subscribe,
        () => true, // sur le client
        () => false // sur le serveur
    );
}
