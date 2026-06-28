# Employee offline demo frontend evidence

- GeneratedAt: 2026-06-21T13:35:17.1499465+08:00
- Scope: Employee offline-demo error classification plus real-browser entry evidence.
- Boundary: this is not the full frontend e2e suite, hosted CI, or staging proof.

## Employee offline-demo unit regressions

```text

> mes-scheduling-ui@1.0.0 test:unit
> vitest run --run tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts


 RUN  v4.1.7 C:/AIWorks/AIMes/v1/src/frontend


 Test Files  2 passed (2)
      Tests  35 passed (35)
   Start at  13:35:18
   Duration  1.61s (transform 378ms, setup 0ms, import 805ms, tests 248ms, environment 1.12s)

```

Exit code: 0

## Employee offline-demo real browser entry

```text

> mes-scheduling-ui@1.0.0 test:e2e
> node ./scripts/e2e.mjs tests/e2e/employee.spec.ts -g backend skip

T  [36mBuilding Nuxt for production...[39m
|
•  [32mNuxt [1m3.21.7[22m[39m[90m (with [39m[90mNitro [1m2.13.4[22m[39m[90m, Vite [1m7.3.5[22m[39m[90m and Vue [1m3.5.34[22m[39m[90m)[39m
[90m[[90mnuxt:tailwindcss[90m][39m [36mi[39m Using default Tailwind CSS file
|
•  Nitro preset: [36mnode-server[39m
[36mi[39m Building client...
[36mi[39m [36mvite v7.3.5 [32mbuilding client environment for production...[36m[39m
[36mi[39m transforming...
[36mi[39m [32m✓[39m 863 modules transformed.
[36mi[39m rendering chunks...
[36mi[39m computing gzip size...
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32mmanifest.json                       [39m[1m[2m 16.60 kB[22m[1m[22m[2m │ gzip:   2.16 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32m_nuxt/primeicons.C6QP2o4f.woff2     [39m[1m[2m 35.15 kB[22m[1m[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32m_nuxt/primeicons.MpK4pl85.ttf       [39m[1m[2m 84.98 kB[22m[1m[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32m_nuxt/primeicons.WjwUDZjB.woff      [39m[1m[2m 85.06 kB[22m[1m[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32m_nuxt/primeicons.DMOk5skT.eot       [39m[1m[2m 85.16 kB[22m[1m[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[32m_nuxt/primeicons.Dr5RGzOO.svg       [39m[1m[2m342.53 kB[22m[1m[22m[2m │ gzip: 105.26 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/change-password.BzTyD2JR.css  [39m[1m[2m  1.85 kB[22m[1m[22m[2m │ gzip:   0.67 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/login.DraKjhOf.css            [39m[1m[2m  2.34 kB[22m[1m[22m[2m │ gzip:   0.83 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/GanttChart.DS3DF9YT.css       [39m[1m[2m  3.09 kB[22m[1m[22m[2m │ gzip:   1.07 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/barcode.Dh1-CxU8.css          [39m[1m[2m  5.00 kB[22m[1m[22m[2m │ gzip:   1.28 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/scanner.Ct0Rw_VY.css          [39m[1m[2m  5.61 kB[22m[1m[22m[2m │ gzip:   1.35 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/routing.C07yOtPb.css          [39m[1m[2m  8.04 kB[22m[1m[22m[2m │ gzip:   1.78 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/anomaly.K-nxb80B.css          [39m[1m[2m  9.09 kB[22m[1m[22m[2m │ gzip:   1.96 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/audit-logs.BNgONkXB.css       [39m[1m[2m  9.38 kB[22m[1m[22m[2m │ gzip:   2.18 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/employee.DJ4i9z6X.css         [39m[1m[2m 10.34 kB[22m[1m[22m[2m │ gzip:   2.11 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/risk.BevsIgSV.css             [39m[1m[2m 12.00 kB[22m[1m[22m[2m │ gzip:   2.40 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/inventory.85XbkFuZ.css        [39m[1m[2m 12.02 kB[22m[1m[22m[2m │ gzip:   2.40 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/bom.DPUHudvt.css              [39m[1m[2m 12.45 kB[22m[1m[22m[2m │ gzip:   2.26 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/documents.BCD_ul2x.css        [39m[1m[2m 13.87 kB[22m[1m[22m[2m │ gzip:   2.75 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/dashboard.DLrtjJ0W.css        [39m[1m[2m 14.00 kB[22m[1m[22m[2m │ gzip:   2.79 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/equipment.DcTT2QLr.css        [39m[1m[2m 14.14 kB[22m[1m[22m[2m │ gzip:   2.85 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/monitoring.C5OZj_kS.css       [39m[1m[2m 14.32 kB[22m[1m[22m[2m │ gzip:   2.75 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/purchase.CJLfuwVK.css         [39m[1m[2m 16.53 kB[22m[1m[22m[2m │ gzip:   2.95 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/production.DQN1hDCX.css       [39m[1m[2m 17.58 kB[22m[1m[22m[2m │ gzip:   3.26 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/admin.Dti3PXTw.css            [39m[1m[2m 29.89 kB[22m[1m[22m[2m │ gzip:   4.12 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/quality.BQNy_yfJ.css          [39m[1m[2m 31.14 kB[22m[1m[22m[2m │ gzip:   4.90 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/report.DNIdAn7w.css           [39m[1m[2m 37.65 kB[22m[1m[22m[2m │ gzip:   4.86 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/scheduling.CfJDpn0V.css       [39m[1m[2m 39.55 kB[22m[1m[22m[2m │ gzip:   6.87 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/entry.BjWgG0Xr.css            [39m[1m[2m 48.04 kB[22m[1m[22m[2m │ gzip:  10.97 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[35m_nuxt/gantt.vp8VADuS.css            [39m[1m[2m 89.52 kB[22m[1m[22m[2m │ gzip:  44.58 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DjEjD_-J.js                   [39m[1m[2m  0.12 kB[22m[1m[22m[2m │ gzip:   0.13 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/B2metsQv.js                   [39m[1m[2m  0.24 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/B0Si-_Vo.js                   [39m[1m[2m  0.33 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DmX1Lz5n.js                   [39m[1m[2m  0.50 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BwazXHFc.js                   [39m[1m[2m  0.60 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/F6sStpoo.js                   [39m[1m[2m  0.64 kB[22m[1m[22m[2m │ gzip:   0.28 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/fEUe9GEL.js                   [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/QSnEoZdg.js                   [39m[1m[2m  0.71 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BP9BZCrq.js                   [39m[1m[2m  0.87 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/bAH3d_un.js                   [39m[1m[2m  0.88 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/Drtr9_3j.js                   [39m[1m[2m  1.15 kB[22m[1m[22m[2m │ gzip:   0.64 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BQ1D2QFT.js                   [39m[1m[2m  1.24 kB[22m[1m[22m[2m │ gzip:   0.72 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/cLcJnw2F.js                   [39m[1m[2m  1.29 kB[22m[1m[22m[2m │ gzip:   0.44 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DldbpVtQ.js                   [39m[1m[2m  1.48 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/CnvyuMLb.js                   [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.92 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/CoIgOwp0.js                   [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.50 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/D6xPYlS1.js                   [39m[1m[2m  1.95 kB[22m[1m[22m[2m │ gzip:   0.49 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DwWlZTzp.js                   [39m[1m[2m  2.09 kB[22m[1m[22m[2m │ gzip:   1.00 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/LP30pT1k.js                   [39m[1m[2m  2.39 kB[22m[1m[22m[2m │ gzip:   1.10 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/kRq60yhh.js                   [39m[1m[2m  3.05 kB[22m[1m[22m[2m │ gzip:   1.36 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/CcK8vyiI.js                   [39m[1m[2m  3.36 kB[22m[1m[22m[2m │ gzip:   1.45 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/Z6PJ0sYX.js                   [39m[1m[2m  3.77 kB[22m[1m[22m[2m │ gzip:   1.55 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BQRyQtmi.js                   [39m[1m[2m  4.34 kB[22m[1m[22m[2m │ gzip:   1.95 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/q6NJg3g_.js                   [39m[1m[2m  8.13 kB[22m[1m[22m[2m │ gzip:   3.66 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/ChEzAj0c.js                   [39m[1m[2m  9.40 kB[22m[1m[22m[2m │ gzip:   4.26 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/C3rVwXKh.js                   [39m[1m[2m  9.42 kB[22m[1m[22m[2m │ gzip:   3.78 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/Du2o_Zi1.js                   [39m[1m[2m 15.99 kB[22m[1m[22m[2m │ gzip:   6.25 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DukkHMzN.js                   [39m[1m[2m 17.24 kB[22m[1m[22m[2m │ gzip:   6.15 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/bv5IXQPG.js                   [39m[1m[2m 17.62 kB[22m[1m[22m[2m │ gzip:   6.69 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BFvlp7dJ.js                   [39m[1m[2m 19.50 kB[22m[1m[22m[2m │ gzip:   6.89 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DEFEsmVN.js                   [39m[1m[2m 22.61 kB[22m[1m[22m[2m │ gzip:   7.47 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/C-4OJ2Ui.js                   [39m[1m[2m 24.32 kB[22m[1m[22m[2m │ gzip:   7.82 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BUQZMyKX.js                   [39m[1m[2m 24.68 kB[22m[1m[22m[2m │ gzip:   8.43 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/CN4Q7pzD.js                   [39m[1m[2m 24.71 kB[22m[1m[22m[2m │ gzip:   9.01 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/rNAHgmL-.js                   [39m[1m[2m 31.33 kB[22m[1m[22m[2m │ gzip:   9.76 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BV-3SVSk.js                   [39m[1m[2m 32.01 kB[22m[1m[22m[2m │ gzip:   9.79 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/Bm7ZXfNJ.js                   [39m[1m[2m 42.07 kB[22m[1m[22m[2m │ gzip:  12.16 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BAt6PMTu.js                   [39m[1m[2m 49.94 kB[22m[1m[22m[2m │ gzip:  15.51 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/o_aTnTH8.js                   [39m[1m[2m 55.65 kB[22m[1m[22m[2m │ gzip:  14.35 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/5g4Koiuv.js                   [39m[1m[2m 60.41 kB[22m[1m[22m[2m │ gzip:  16.77 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DWta39Gl.js                   [39m[1m[2m 71.96 kB[22m[1m[22m[2m │ gzip:  19.20 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DMn1RoGg.js                   [39m[1m[2m 73.99 kB[22m[1m[22m[2m │ gzip:  21.55 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/BR7xzFPn.js                   [39m[1m[2m 82.91 kB[22m[1m[22m[2m │ gzip:  21.09 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/DFrHaJHk.js                   [39m[1m[2m 93.46 kB[22m[1m[22m[2m │ gzip:  36.88 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/D-WIeWxe.js                   [39m[1m[2m149.88 kB[22m[1m[22m[2m │ gzip:  44.37 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/z-F-zMSE.js                   [39m[1m[2m359.43 kB[22m[1m[22m[2m │ gzip: 109.91 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/Dzxo-Mot.js                   [39m[1m[2m734.51 kB[22m[1m[22m[2m │ gzip: 209.38 kB[22m
[36mi[39m [2m.nuxt-e2e-26580/dist/client/[22m[36m_nuxt/CrJDH5Lx.js                   [39m[1m[2m828.75 kB[22m[1m[22m[2m │ gzip: 210.12 kB[22m
[36mi[39m [32m✓ built in 12.78s[39m
[32m√[39m Client built in 12797ms
[36mi[39m Building server...
[36mi[39m [36mvite v7.3.5 [32mbuilding ssr environment for production...[36m[39m
[36mi[39m transforming...
[36mi[39m [32m✓[39m 1 modules transformed.
[36mi[39m rendering chunks...
[36mi[39m [32m✓ built in 21ms[39m
[32m√[39m Server built in 57ms
[90m[[90mnitro[90m][39m [32m√[39m Generated public [36m.output-e2e-26580/public[39m
[90m[[90mnitro[90m][39m [36mi[39m Building Nuxt Nitro server (preset: [36mnode-server[39m, compatibility date: [36m2026-05-18[39m)
[90m[[90mnitro[90m][39m [32m√[39m Nuxt Nitro server built
[90m  ├─ .output-e2e-26580/server/chunks/_/error-500.mjs (5.82 kB)[39m[90m (2.4 kB gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/_/error-500.mjs.map (250 B)[39m[90m (184 B gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/_/nitro.mjs (172 kB)[39m[90m (42.5 kB gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/_/nitro.mjs.map (2.8 kB)[39m[90m (704 B gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/build/client.precomputed.mjs (45.8 kB)[39m[90m (4.39 kB gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/build/client.precomputed.mjs.map (45.9 kB)[39m[90m (1.82 kB gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/routes/renderer.mjs (11.1 kB)[39m[90m (3.73 kB gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/routes/renderer.mjs.map (717 B)[39m[90m (249 B gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/virtual/_virtual_spa-template.mjs (94 B)[39m[90m (100 B gzip)[39m
[90m  ├─ .output-e2e-26580/server/chunks/virtual/_virtual_spa-template.mjs.map (90 B)[39m[90m (98 B gzip)[39m
[90m  ├─ .output-e2e-26580/server/index.mjs (1.67 kB)[39m[90m (737 B gzip)[39m
[90m  └─ .output-e2e-26580/server/package.json (664 B)[39m[90m (302 B gzip)[39m
[36mΣ Total size:[39m 1.78 MB (416 kB gzip)
[90m[[90mnitro[90m][39m [32m√[39m You can preview this build using [36mnode .output-e2e-26580/server/index.mjs[39m
|
—  ✨ Build complete!

Running 1 test using 1 worker

  ok 1 [chromium] › tests\e2e\employee.spec.ts:68:3 › Employee offline demo entry › 显式离线演示入口展示本地员工且不暴露 backend skip 技术错误 (963ms)

  1 passed (2.9s)
```

Exit code: 0

Result: PASS

- FinishedAt: 2026-06-21T13:35:42.9279726+08:00
