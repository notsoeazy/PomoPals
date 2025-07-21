# Makefile

run:
	# Run Tailwind and Flask together
	npx @tailwindcss/cli -i ./static/src/input.css -o ./static/dist/output.css --watch & \
	sleep 1 && \
	flask run

tailwind:
	npx @tailwindcss/cli -i ./static/src/input.css -o ./static/dist/output.css --watch

flask:
	FLASK_APP=app.py FLASK_ENV=development flask run
