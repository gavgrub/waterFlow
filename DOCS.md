# SSR Water Flow Documentation
This text file is meant to explain how this program works at a very low level, to assist whoever comes after me in continuing to develop the project. I understand that the people who follow me will not necessarily be extremely tech savy, so I will be writing this in a way such that someone without a computer science / software engineering background could follow it. Apologies to those who have to trudge through this.

## Terminology
I feel it is a good idea to define the terms that will be used throughout this doccument, as I am not sure that the organization which I am developing this project for for will have encountered them before.
- **Git** → A version control software. Helps with tracking and managing the changes to your code over time. Used for collaborating on projects, testing without interfering with production code, and going back to previous versions when something breaks.
- **GitHub** → A website that works with Git and acts as a remote backup for code. It’s similar to OneDrive or Google Drive, but specifically designed for tracking changes in code and collaborating with others on software projects.
- **json** → A file format which stores data in a structured way.
- **geojson** → A specific type of json file which stores geographic data.
- **HTML (Hypertext Markup Language)** → A markup language, defines the layout of a website.
- **CSS (Cascading Style Sheets)** → A style sheet language, defines the styling of a website.
- **JS (JavaScript)** → A programming language, commonly used in web development to make interactive elements.
- **Polyline** → A shape made by connecting multiple points with straight lines. Stored in the geojson file format.
- **String** → How a computer stores plain text. Must be surrounded with double quotes ("").

## Mapping

### Framework
This software's interactive map is built with Leaflet (https://leafletjs.com/), an open source JavaScript library for mobile friendly interactive maps. The documentation for this software can be found on their website (https://leafletjs.com/reference.html). It is pretty in depth, so if any clarification is needed, I would recommend starting there.

All of the code for the interactive elements of the map can be found within scripts/map.js, the code is well documented (if mostly vibecode), so it should be easy to add things to it.

For the purposes of this project, all geographic data must be in the **geojson** file format, not kml or xml.

### Rivers
The geographic data for the rivers is stored in geodata/rivers. There, you will find 4 folders titled 1-4, along with the file **data.json**. 

Each folder contains the geojson files of each of the rivers which are displayed within the website, specifically, as **polylines**. The number of the folder represents the "degree" of the tributary (ex. the SSR is degree 1, the bow river is a tributary of the SSR, so it is degree 2, and the elbow river is a tributary of the bow river, so it is degree 3), and contains nothing but the geojson files of each of the rivers. The title of each file should be the name of the river it represents. In the event that multiple files are needed to represent one river, a number can be added to the end of it's title, and they will all be displayed as the same river (ex. "Bow River 1.geojson", "Bow River 2.geojson", "Bow River 3.geojson").

**data.json** is a file which contains additional information about the rivers, as well as their locations in the files. Normally, I would have built the program to automatically load all data within the geodata folder to keep the program flexible, however, as this project is a website, it cannot automatically read all files in a folder due to browser security restrictions. The format of the file is as follows
- Each item at the top-level array represents a folder, identified by the "folder" key, with a number as it's value representing the name of the folder (ex. "1", "2", "3").
- Inside each folder object, there is a "rivers" list containing multiple river objects.
- Each river object contains "name" - the river's name as a string (must be the same as the geojson file it is representing, ex. "Spray River 1.geojson" has the name value "Spray River 1"), and "wiki" - a URL string linking to a Wikipedia page or other relevant site for more information about that river.

### Other Features
Other features outside of rivers are stored as geojson files inside of the geodata folder. Unlike the rivers, which load in based on the information in data.json, the other features are loaded within **map.js** - the script which handles all of the interactive parts of the website.

## Website

### Layout
The layout of the website is found within **index.html**.

### Styling
The styling of the website is found within **styles.css**.

## Author
Created by Gavin Grubert.
Contact: grubertgavin@gmail.com 
GitHub: https://github.com/gavgrub