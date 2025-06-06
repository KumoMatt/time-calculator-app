
#!/usr/bin/env node

// Questo hook viene eseguito dopo che la piattaforma Android è stata preparata ('after_prepare').
// Inietta una strategia di risoluzione delle dipendenze per le librerie Kotlin
// nel file build.gradle dell'app Android, per risolvere i conflitti di classi duplicate.

const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    console.log('Esecuzione hook: android-kotlin-fix.js');

    const platformRoot = path.join(context.hook, 'platforms', 'android');
    const appGradlePath = path.join(platformRoot, 'app', 'build.gradle');

    if (fs.existsSync(appGradlePath)) {
        let appGradleContent = fs.readFileSync(appGradlePath, 'utf-8');

        const kotlinResolutionStrategy = `
configurations.all {
    resolutionStrategy {
        eachDependency { details ->
            if (details.requested.group == 'org.jetbrains.kotlin') {
                if (details.requested.name == 'kotlin-stdlib' ||
                    details.requested.name == 'kotlin-stdlib-jdk7' ||
                    details.requested.name == 'kotlin-stdlib-jdk8') {
                    details.useVersion '1.8.22' // Forza la versione di Kotlin
                }
            }
        }
    }
}
`;

        // Controlla se la strategia è già stata aggiunta per evitare duplicati
        if (!appGradleContent.includes("details.useVersion '1.8.22'")) {
            // Cerca un punto comune dove aggiungere la configurazione, es. alla fine del file
            // o dopo la sezione 'android {' se presente. Per semplicità, la aggiungiamo alla fine.
            appGradleContent += `\n${kotlinResolutionStrategy}\n`;
            fs.writeFileSync(appGradlePath, appGradleContent, 'utf-8');
            console.log('Strategia di risoluzione Kotlin iniettata in app/build.gradle');
        } else {
            console.log('Strategia di risoluzione Kotlin già presente in app/build.gradle. Nessuna modifica.');
        }
    } else {
        console.error(`Errore: File non trovato al percorso: ${appGradlePath}. L'hook non può procedere.`);
    }
};
