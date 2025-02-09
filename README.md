Set up instructions<br>
Prerequisites:
- PostgreSQL installed on your local machine.<br>
- Node.js installed.<br>
- Python with pip installed.<br>
<br>
- Important notice: I used Postgres for storing DB on my local machine. In order to run a demo, you’ll need to create a local Postgres DB on your machine and change the environment file according to your DB parameters. <br>
DB schema is mentioned on the file 'dbSchemaForPostgres'<br>
<br>
Here are the steps for running the application:<br>

- Download this git repo.
- Make sure you get the environment file separately, change it according to your local DB set up and add the file to the folder.
- Open a terminal and run the following commands, make sure you are in the correct path of the project’s folder: <br>
npm install <br>
pip install -r requirements.txt <br>
python .\api\app.py<br>
- Open a new terminal and run the next command: <br>
npm run dev <br>

On the second terminal you'll get a local host directory. Copy this link to your browser for checking out the results.


# React + Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
