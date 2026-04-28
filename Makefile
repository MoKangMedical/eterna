.PHONY: run test lint install clean docker-build docker-run docker-stop

run:
	python -m uvicorn api.app:app --reload --port 8102

test:
	python -m pytest tests/ -v --tb=short

lint:
	python -m py_compile api/app.py
	python -m py_compile api/*.py

install:
	pip install -r requirements.txt
	pip install pytest httpx

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -name '*.pyc' -delete
	rm -rf .pytest_cache

docker-build:
	docker build -t eterna .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down
