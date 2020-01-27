# unmangleProofPointSafelinks

Thunderbird plugin to unmangle ProofPoint Defense Safelinks

Based on the [unmangleOutlookSafelinks extension](https://github.com/phavekes/unmangleOutlookSafelinks).

[ProofPoint Defense](https://www.proofpoint.com/us/products/email-fraud-defense), as used by certain organizations such as my dear employer [https://www.tudelft.nl/](Delft University of Technology), changes all URLs in emails to redirect to a ProofPoint server before opening.
This not only violates one's privacy as it leaks information to ProofPoint, but it also makes it impossible to determine if the original URL was safe to open.
For example, a link to `http://phishingsite.fake.ru/you/are/hacked.php` will be turned into `https://urldefense.proofpoint.com/v2/url?u=http-3A__phishingsite.fake.ru&d=...`, and will not be recognized by a user as dangerous.
This plugin will change the URL back to its original value.
