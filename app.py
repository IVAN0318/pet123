from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import pandas as pd
import io

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///surveys.db'
db = SQLAlchemy(app)

class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cat_name = db.Column(db.String(100), nullable=False)
    cat_age = db.Column(db.Integer, nullable=False)
    cat_gender = db.Column(db.String(10), nullable=False)
    cat_weight = db.Column(db.Float, nullable=False)
    total_score = db.Column(db.Integer, nullable=False)
    diet_score = db.Column(db.Integer, nullable=False)
    skin_score = db.Column(db.Integer, nullable=False)
    kidney_score = db.Column(db.Integer, nullable=False)
    behavior_score = db.Column(db.Integer, nullable=False)
    dental_score = db.Column(db.Integer, nullable=False)
    digestion_score = db.Column(db.Integer, nullable=False)
    history_score = db.Column(db.Integer, nullable=False)
    date_submitted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cat_name': self.cat_name,
            'cat_age': self.cat_age,
            'cat_gender': self.cat_gender,
            'cat_weight': self.cat_weight,
            'total_score': self.total_score,
            'diet_score': self.diet_score,
            'skin_score': self.skin_score,
            'kidney_score': self.kidney_score,
            'behavior_score': self.behavior_score,
            'dental_score': self.dental_score,
            'digestion_score': self.digestion_score,
            'history_score': self.history_score,
            'date_submitted': self.date_submitted
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_survey', methods=['POST'])
def submit_survey():
    data = request.json
    new_survey = Survey(
        cat_name=data['catName'],
        cat_age=data['catAge'],
        cat_gender=data['catGender'],
        cat_weight=data['catWeight'],
        total_score=data['totalScore'],
        diet_score=data['categoryScores']['diet'],
        skin_score=data['categoryScores']['skin'],
        kidney_score=data['categoryScores']['kidney'],
        behavior_score=data['categoryScores']['behavior'],
        dental_score=data['categoryScores']['dental'],
        digestion_score=data['categoryScores']['digestion'],
        history_score=data['categoryScores']['history']
    )
    db.session.add(new_survey)
    db.session.commit()
    return jsonify({"message": "Survey submitted successfully", "survey_id": new_survey.id}), 201

@app.route('/results/<int:survey_id>')
def results(survey_id):
    survey = Survey.query.get_or_404(survey_id)
    return render_template('results.html', survey=survey)

@app.route('/admin')
def admin_panel():
    surveys = Survey.query.order_by(Survey.date_submitted.desc()).all()
    return render_template('admin.html', surveys=surveys)

@app.route('/export_excel')
def export_excel():
    surveys = Survey.query.all()
    data = []
    for survey in surveys:
        data.append({
            'ID': survey.id,
            '貓咪名稱': survey.cat_name,
            '年齡': survey.cat_age,
            '性別': survey.cat_gender,
            '體重': survey.cat_weight,
            '總分': survey.total_score,
            '飲食與營養': survey.diet_score,
            '毛髮與皮膚': survey.skin_score,
            '腎臟健康': survey.kidney_score,
            '情緒與行為': survey.behavior_score,
            '牙齒與口腔': survey.dental_score,
            '消化與排泄': survey.digestion_score,
            '壽命與健康史': survey.history_score,
            '提交日期': survey.date_submitted
        })
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Surveys')
    output.seek(0)
    
    return send_file(output, 
                     attachment_filename='surveys.xlsx',
                     as_attachment=True,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    
    query = Survey.query
    if search:
        query = query.filter(Survey.cat_name.contains(search))
    
    pagination = query.order_by(Survey.date_submitted.desc()).paginate(page=page, per_page=per_page)
    surveys = pagination.items
    
    return jsonify({
        'surveys': [survey.to_dict() for survey in surveys],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page
    })

@app.route('/api/submit_survey', methods=['POST'])
def api_submit_survey():
    data = request.json
    new_survey = Survey(
        cat_name=data['catName'],
        cat_age=data['catAge'],
        cat_gender=data['catGender'],
        cat_weight=data['catWeight'],
        total_score=data['totalScore'],
        diet_score=data['categoryScores']['diet'],
        skin_score=data['categoryScores']['skin'],
        kidney_score=data['categoryScores']['kidney'],
        behavior_score=data['categoryScores']['behavior'],
        dental_score=data['categoryScores']['dental'],
        digestion_score=data['categoryScores']['digestion'],
        history_score=data['categoryScores']['history']
    )
    db.session.add(new_survey)
    db.session.commit()
    return jsonify({"message": "Survey submitted successfully"}), 201

@app.route('/api/export_excel')
def api_export_excel():
    surveys = Survey.query.all()
    data = []
    for survey in surveys:
        data.append({
            'ID': survey.id,
            '貓咪名稱': survey.cat_name,
            '年齡': survey.cat_age,
            '性別': survey.cat_gender,
            '體重': survey.cat_weight,
            '總分': survey.total_score,
            '飲食與營養': survey.diet_score,
            '毛髮與皮膚': survey.skin_score,
            '腎臟健康': survey.kidney_score,
            '情緒與行為': survey.behavior_score,
            '牙齒與口腔': survey.dental_score,
            '消化與排泄': survey.digestion_score,
            '壽命與健康史': survey.history_score,
            '提交日期': survey.date_submitted
        })
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Surveys')
    output.seek(0)
    
    return send_file(output, 
                     attachment_filename='surveys.xlsx',
                     as_attachment=True,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@app.route('/api/stats')
def get_stats():
    total_surveys = Survey.query.count()
    avg_score = db.session.query(db.func.avg(Survey.total_score)).scalar()
    return jsonify({
        'total_surveys': total_surveys,
        'avg_score': round(avg_score, 2) if avg_score else 0
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)