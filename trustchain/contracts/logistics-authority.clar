;; Logistics Authority Verification Contract
;; This contract validates and manages logistics providers within a decentralized supply chain.

(define-data-var admin principal tx-sender)

;; Map to store verified logistics authorities
(define-map verified-logistics-authorities principal bool)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-VERIFIED u101)
(define-constant ERR-NOT-FOUND u102)

;; Private function to check admin rights
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Add a new logistics authority
(define-public (add-logistics-authority (authority principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? verified-logistics-authorities authority)) (err ERR-ALREADY-VERIFIED))
    (map-set verified-logistics-authorities authority true)
    (ok true)
  )
)

;; Remove a logistics authority
(define-public (remove-logistics-authority (authority principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-some (map-get? verified-logistics-authorities authority)) (err ERR-NOT-FOUND))
    (map-delete verified-logistics-authorities authority)
    (ok true)
  )
)

;; Check if a logistics authority is verified
(define-read-only (is-verified-logistics-authority (authority principal))
  (default-to false (map-get? verified-logistics-authorities authority))
)

;; Transfer admin rights to a new principal
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
