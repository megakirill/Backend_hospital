from hypothesis import given, settings, strategies as st

from backend.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)


@given(st.text(max_size=512))
@settings(max_examples=200)
def test_decode_token_handles_arbitrary_input(token):
    payload = decode_token(token)

    assert payload is None or isinstance(payload, dict)


@given(
    user_id=st.integers(min_value=1, max_value=10**9),
    role=st.sampled_from(["patient", "doctor", "admin"]),
)
def test_access_token_roundtrip_preserves_user_claims(user_id, role):
    token = create_access_token({
        "sub": str(user_id),
        "role": role,
    })

    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["role"] == role
    assert payload["type"] == "access"


@given(
    user_id=st.integers(min_value=1, max_value=10**9),
    role=st.sampled_from(["patient", "doctor", "admin"]),
)
def test_refresh_token_roundtrip_preserves_token_type(user_id, role):
    token = create_refresh_token({
        "sub": str(user_id),
        "role": role,
    })

    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["role"] == role
    assert payload["type"] == "refresh"
