import { expect } from 'chai';
import { isSameTime, isWindowMiss, isWindowOpen } from './check-window.helper';

describe('check window helpers', () => {
    describe('isSameTime should return', () => {
        it('false when values are different', () => {
            const d1 = new Date('2020-05-31T06:32+03:00');
            const d2 = new Date('2020-05-31T06:32+02:00');
            expect(isSameTime(d1, d2)).to.be.false;
        });

        it('true when values are same', () => {
            const d1 = new Date('2020-05-31T06:32+02:00');
            const d2 = new Date('2020-05-31T06:32+02:00');
            expect(isSameTime(d1, d2)).to.be.true;
        });
    });

    describe('isWindowOpen should return', () => {
        it('false when window is already closed', () => {
            const baseTimestamp = new Date().getTime();
            const open = new Date(baseTimestamp - 10000);
            const close = new Date(baseTimestamp - 1000);
            expect(isWindowOpen(open, close)).to.be.false;
        });

        it('false when window is not open yet', () => {
            const baseTimestamp = new Date().getTime();
            const open = new Date(baseTimestamp + 10000);
            const close = new Date(baseTimestamp + 20000);
            expect(isWindowOpen(open, close)).to.be.false;
        });

        it('true when now is between open and close', () => {
            const baseTimestamp = new Date().getTime();
            const open = new Date(baseTimestamp - 10000);
            const close = new Date(baseTimestamp + 20000);
            expect(isWindowOpen(open, close)).to.be.true;
        });
    });

    describe('isWindowMiss should return', () => {
        it('true when window is already closed', () => {
            const baseTimestamp = new Date().getTime();
            const close = new Date(baseTimestamp - 1000);
            expect(isWindowMiss(close)).to.be.true;
        });

        it('false when window is not open yet', () => {
            const baseTimestamp = new Date().getTime();
            const close = new Date(baseTimestamp + 20000);
            expect(isWindowMiss(close)).to.be.false;
        });
    });
});
