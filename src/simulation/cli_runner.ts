import { runAllSimulations } from './run_simulation';

const results = runAllSimulations();
console.log(JSON.stringify(results, null, 2));
