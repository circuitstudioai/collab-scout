import {withDemoDeadline} from '../lib/sites/demo-deadline';
it('aborts live work before falling back instead of leaving the browser waiting for the host timeout',async()=>{
 jest.useFakeTimers();let signal:AbortSignal|undefined;const request=withDemoDeadline(s=>{signal=s;return new Promise(()=>{});});const assertion=expect(request).rejects.toThrow('deadline');await jest.advanceTimersByTimeAsync(60000);await assertion;expect(signal?.aborted).toBe(true);jest.useRealTimers();
});
it('returns live evidence and clears the deadline when the work completes',async()=>{await expect(withDemoDeadline(async()=>42)).resolves.toBe(42);});
