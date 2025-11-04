from __future__ import annotations


def test_metrics_endpoint_exposes_prometheus_payload(client):
    """The /metrics endpoint should be reachable and expose Prometheus metrics."""

    response = client.get("/metrics")

    assert response.status_code == 200
    payload = response.data.decode("utf-8")
    assert "http_request_duration_seconds" in payload
    assert "http_requests_total" in payload
