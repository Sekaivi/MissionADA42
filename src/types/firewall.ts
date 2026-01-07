export interface FirewallState {
    temp: number;
    stabilityProgress: number; // 0 à 3000ms
    isStable: boolean;
    isBlowing: boolean;
    status: 'IDLE' | 'CALIBRATING' | 'RUNNING' | 'WIN' | 'FAIL';
}