import { describe, it, expect, beforeEach } from "vitest"

const mockContract = {
  admin: "ST1ADMIN0000000000000000000000000000000",
  verifiedAuthorities: new Map<string, boolean>(),

  isAdmin(caller: string) {
    return caller === this.admin
  },

  addAuthority(caller: string, authority: string) {
    if (!this.isAdmin(caller)) return { error: 100 } // ERR-NOT-AUTHORIZED
    if (this.verifiedAuthorities.has(authority)) return { error: 101 } // ERR-ALREADY-VERIFIED
    this.verifiedAuthorities.set(authority, true)
    return { value: true }
  },

  removeAuthority(caller: string, authority: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    if (!this.verifiedAuthorities.has(authority)) return { error: 102 }
    this.verifiedAuthorities.delete(authority)
    return { value: true }
  },

  isVerifiedAuthority(authority: string) {
    return this.verifiedAuthorities.has(authority)
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.admin = newAdmin
    return { value: true }
  },
}

describe("Logistics Authority Verification Contract", () => {
  beforeEach(() => {
    mockContract.admin = "ST1ADMIN0000000000000000000000000000000"
    mockContract.verifiedAuthorities = new Map()
  })

  it("should add a new authority when called by admin", () => {
    const result = mockContract.addAuthority(
      "ST1ADMIN0000000000000000000000000000000",
      "ST2AUTH00000000000000000000000000000000"
    )
    expect(result).toEqual({ value: true })
    expect(mockContract.isVerifiedAuthority("ST2AUTH00000000000000000000000000000000")).toBe(true)
  })

  it("should reject adding authority when called by non-admin", () => {
    const result = mockContract.addAuthority(
      "ST3NONADMIN0000000000000000000000000000",
      "ST4AUTH00000000000000000000000000000000"
    )
    expect(result).toEqual({ error: 100 })
  })

  it("should reject adding an already verified authority", () => {
    mockContract.addAuthority("ST1ADMIN0000000000000000000000000000000", "ST2AUTH00000000000000000000000000000000")
    const result = mockContract.addAuthority(
      "ST1ADMIN0000000000000000000000000000000",
      "ST2AUTH00000000000000000000000000000000"
    )
    expect(result).toEqual({ error: 101 })
  })

  it("should remove an authority when called by admin", () => {
    mockContract.addAuthority("ST1ADMIN0000000000000000000000000000000", "ST2AUTH00000000000000000000000000000000")
    const result = mockContract.removeAuthority(
      "ST1ADMIN0000000000000000000000000000000",
      "ST2AUTH00000000000000000000000000000000"
    )
    expect(result).toEqual({ value: true })
    expect(mockContract.isVerifiedAuthority("ST2AUTH00000000000000000000000000000000")).toBe(false)
  })

  it("should reject removing a non-existent authority", () => {
    const result = mockContract.removeAuthority(
      "ST1ADMIN0000000000000000000000000000000",
      "ST5FAKEAUTH0000000000000000000000000000"
    )
    expect(result).toEqual({ error: 102 })
  })

  it("should transfer admin rights correctly", () => {
    const result = mockContract.transferAdmin(
      "ST1ADMIN0000000000000000000000000000000",
      "ST9NEWADMIN0000000000000000000000000000"
    )
    expect(result).toEqual({ value: true })
    expect(mockContract.admin).toBe("ST9NEWADMIN0000000000000000000000000000")
    const addResult = mockContract.addAuthority(
      "ST9NEWADMIN0000000000000000000000000000",
      "ST8AUTH00000000000000000000000000000000"
    )
    expect(addResult).toEqual({ value: true })
  })
})
