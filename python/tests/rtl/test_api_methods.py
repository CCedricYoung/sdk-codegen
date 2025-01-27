# The MIT License (MIT)
#
# Copyright (c) 2019 Looker Data Sciences, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import datetime
import json
from typing import MutableMapping, Optional

import pytest  # type: ignore

from looker_sdk import error
from looker_sdk.rtl import auth_session
from looker_sdk.rtl import api_settings
from looker_sdk.rtl import api_methods
from looker_sdk.rtl import requests_transport
from looker_sdk.rtl import serialize
from looker_sdk.rtl import transport
from looker_sdk.sdk import models


@pytest.fixture(scope="module")  # type: ignore
def api() -> api_methods.APIMethods:
    settings = api_settings.ApiSettings.configure("../looker.ini")
    transport = requests_transport.RequestsTransport.configure(settings)
    auth = auth_session.AuthSession(settings, transport, serialize.deserialize)
    return api_methods.APIMethods(
        auth, serialize.deserialize, serialize.serialize, transport
    )


@pytest.mark.parametrize(  # type: ignore
    "test_query_params, expected",
    [
        ({"a": None}, {}),
        ({"a": True}, {"a": "true"}),
        ({"a": "text"}, {"a": "text"}),
        ({"a": 1}, {"a": "1"}),
        ({"a": [1, 2, 3]}, {"a": "[1, 2, 3]"}),
        ({"a": models.DelimSequence([1, 2, 3])}, {"a": "1,2,3"}),
        ({"a": models.DelimSequence(["a", "b", "c"])}, {"a": "a,b,c"}),
        (
            {
                "a": models.DelimSequence(
                    ["a", "b", "c"], prefix="<", suffix=">", separator="|"
                )
            },
            {"a": "<a|b|c>"},
        ),
        ({"a": ["x", "xy", "xyz"]}, {"a": '["x", "xy", "xyz"]'}),
        ({"a": datetime.datetime(2019, 8, 14, 8, 4, 2)}, {"a": "2019-08-14T08:04Z"}),
    ],
)
def test_convert_query_params(
    api: api_methods.APIMethods,
    test_query_params: api_methods.TQueryParams,
    expected: MutableMapping[str, str],
):
    actual = api._convert_query_params(test_query_params)
    assert actual == expected


@pytest.mark.parametrize(  # type: ignore
    "test_body, expected",
    [
        ("some body text", b"some body text"),
        ("", b""),
        ([1, 2, 3], b"[1, 2, 3]"),
        (["a", "b", "c"], b'["a", "b", "c"]'),
        ({"foo": "bar"}, b'{"foo": "bar"}'),
        (None, None),
        (models.WriteApiSession(workspace_id="dev"), b'{"workspace_id": "dev"}'),
        (
            [
                models.WriteApiSession(workspace_id="dev"),
                models.WriteApiSession(workspace_id="dev"),
            ],
            b'[{"workspace_id": "dev"}, {"workspace_id": "dev"}]',
        ),
    ],
)
def test_get_serialized(
    api: api_methods.APIMethods, test_body: api_methods.TBody, expected: Optional[bytes]
):
    actual = api._get_serialized(test_body)
    assert actual == expected


@pytest.mark.parametrize(  # type: ignore
    "test_response, test_structure, expected",
    [
        (
            transport.Response(ok=True, value="some response text"),
            str,
            "some response text",
        ),
        (transport.Response(ok=True, value=""), None, None),
        (
            transport.Response(
                ok=True,
                value=(
                    json.dumps(
                        {  # type: ignore
                            "current_version": {  # type: ignore
                                "full_version": "6.18.4",
                                "status": "fully functional",
                                "swagger_url": None,
                                "version": None,
                            },
                            "looker_release_version": "6.18",
                            "supported_versions": None,
                        }
                    )
                ),
            ),
            models.ApiVersion,
            models.ApiVersion(
                looker_release_version="6.18",
                current_version=models.ApiVersionElement(
                    version=None,
                    full_version="6.18.4",
                    status="fully functional",
                    swagger_url=None,
                ),
                supported_versions=None,
            ),
        ),
    ],
)
def test_return(
    api: api_methods.APIMethods,
    test_response: transport.Response,
    test_structure: api_methods.TStructure,
    expected: api_methods.TReturn,
):
    actual = api._return(test_response, test_structure)
    assert actual == expected


def test_return_raises_an_SDKError_for_bad_responses(api):
    with pytest.raises(error.SDKError) as exc:
        api._return(transport.Response(ok=False, value="some error message"), str)
    assert "some error message" in str(exc.value)
