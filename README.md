<!--Here are the steps for running the application: -->
- Important notice: I used Postgres for storing DB on my local machine. In order to run a demo, you’ll need to create a local Postgres DB on your machine and change the environment file according to your DB parameters.
- Download this git repo
- Make sure you get the environment file separately, change it according to your local DB set up and add it to the folder
- Open a terminal and run the following commands, make sure you are in the correct path of the project’s folder:
npm install
pip install -r requirements.txt
python .\api\app.py
- Open a new terminal and run the next command:
npm run dev

if you got no errors then you suppose to get a local host directory on the second terminal. Copy this link to your browser for checking out the results.


# React + Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
