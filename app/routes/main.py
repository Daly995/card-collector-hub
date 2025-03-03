from flask import Blueprint, jsonify

bp = Blueprint("main", __name__)


@bp.route("/api/health-check")
def health_check():
    return jsonify({"status": "healthy"})
