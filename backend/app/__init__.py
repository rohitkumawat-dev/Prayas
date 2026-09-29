from flask import Flask, jsonify, send_from_directory
import os
import os
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(
        __name__,
        static_folder="../frontend_dist",
        static_url_path=""
)
    app.config.from_object(config_class)
    
    # Allow local development origins (localhost and 127.0.0.1 on any port) and optional custom CORS_ORIGINS
    cors_origins = [r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"]
    if app.config.get('CORS_ORIGINS'):
        extra_origins = [o.strip() for o in app.config['CORS_ORIGINS'].split(',') if o.strip()]
        cors_origins.extend(extra_origins)

    CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)
    db.init_app(app)
    
    # Register error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": str(error.description)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.modules import modules_bp
    from app.routes.lessons import lessons_bp
    from app.routes.enrollments import enrollments_bp
    from app.routes.quizzes import quizzes_bp
    from app.routes.progress import progress_bp
    from app.routes.certificates import certificates_bp
    from app.routes.trainer import trainer_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(modules_bp, url_prefix='/api/modules')
    app.register_blueprint(lessons_bp, url_prefix='/api/lessons')
    app.register_blueprint(enrollments_bp, url_prefix='/api/enrollments')
    app.register_blueprint(quizzes_bp, url_prefix='/api/quizzes')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(certificates_bp, url_prefix='/api/certificates')
    app.register_blueprint(trainer_bp, url_prefix='/api/trainer')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    # Serve React frontend
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            return jsonify({"success": False, "message": "API route not found"}), 404

        file_path = os.path.join(app.static_folder, path)

        if path and os.path.isfile(file_path):
            return send_from_directory(app.static_folder, path)

        return send_from_directory(app.static_folder, "index.html")
    return app
