# gsuite-imapsync

GSuite ImapSync distributes mailbox migration workload to several workers to make GSuite migration feasible in less time.

It uses [OptimalBits Bull Queue]("https://github.com/OptimalBits/bull/") to distribute workload to one or more worker machines. Each worker can migrate several mailboxes
in parallel and you can keep track of the migration status using [arena]("https://github.com/bee-queue/arena").

A web ui for keeping track of migration is planned, but may not be developed any time soon.
