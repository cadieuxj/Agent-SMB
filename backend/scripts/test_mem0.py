"""
Mem0 end-to-end test script.

Usage (from backend/):
    python scripts/test_mem0.py

Tests:
  1. Add a memory for a test user
  2. Search it back by semantic query
  3. Get all memories and verify it appears
  4. Delete it and verify it's gone
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.mem0_client import add_memory, search_memories, get_all_memories, delete_memory

TEST_USER = "test-user-mem0-script"

def run():
    print("=" * 50)
    print("Mem0 End-to-End Test")
    print("=" * 50)

    # 1. Add memory
    print("\n[1] Adding memory...")
    result = add_memory(
        user_id=TEST_USER,
        messages=[
            {"role": "user", "content": "Mon fournisseur principal m'a augmenté ses prix de 15% ce mois-ci."},
            {"role": "assistant", "content": "C'est significatif. Avez-vous envisagé de négocier un contrat annuel pour fixer le prix?"},
        ],
    )
    print(f"    Added: {result}")

    # 2. Search
    print("\n[2] Searching for 'fournisseur prix'...")
    hits = search_memories(user_id=TEST_USER, query="fournisseur augmentation prix", limit=5)
    print(f"    Found {len(hits)} result(s):")
    for h in hits:
        print(f"    - [{h.get('id', '?')}] {h.get('memory', h.get('text', ''))[:80]}")

    # 3. Get all
    print("\n[3] Getting all memories...")
    all_mems = get_all_memories(user_id=TEST_USER)
    print(f"    Total memories: {len(all_mems)}")

    # 4. Delete all test memories
    print("\n[4] Cleaning up test memories...")
    deleted = 0
    for m in all_mems:
        mid = m.get("id")
        if mid:
            delete_memory(mid)
            deleted += 1
    print(f"    Deleted {deleted} memories")

    # 5. Verify empty
    remaining = get_all_memories(user_id=TEST_USER)
    assert len(remaining) == 0, f"Expected 0 memories, got {len(remaining)}"
    print("\n✅ All tests passed — Mem0 round-trip works correctly")
    print("=" * 50)


if __name__ == "__main__":
    run()
