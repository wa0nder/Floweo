# Floweo.js
Scene graph UI editor written in JavaScript

![alt text](https://lh3.googleusercontent.com/MYLFe-9cHu-mDEfa1bQv-O61FxIvZK4Iykv_D0XLfnS-iD7SuRi0RiG2Z-2AHJ-dU2RolrQs1ZObdWpeJPKi5FfNgnaL6XAZ3sE-pkNAqxOwYXSCdno2wKqQj9_nhpQyMFyS6Aa--d4FbNd_RVldF7Ra58-AUTi-bjaOWTRBpiVS7XLtwIWZ4niGil0ot1WaDycx6UOQQXl02w6ov88qaz4TwkcGTt7vVJNxpdgGyo71ZB-4SkLv9Q1Swc9S_QxSSFOIBl3n_XRzM1_9k-2Zl0PQC7WGrVYjdARsK-cCCF_v-ahgCFxrK--0hw-2ebqgKaF14TEqC4VqZO4wsd8DWznq4ja_KHfOYvTZTOOgkxpMn62ij8Eg_So-kduzI6ccCdWJjbxgafoIbhX83WHSnpDYGF1U0hBy3J-4YCLFKY1C4BQabPgTd_QHSaOMQkJ9Fts9fNgsV_0nxvYVDw03q9eNIhT46vqVSM4IHRaeHz_E5c6-aoCJnRpriUWtKhsXQvoNkkvgmgfCvbNnAdNEmKAM1nDQukCkQanw2SSnaMmTQEEV0SXLK4dKcActt8gU-_jYb1ziJBt15SGER5bATxkxOn9tfEn7zGVtjGxYc3UAV3V-iC7gcQ4BSlinCcb6SOm7WVnC3fXB3kH0J8pTSvIdpuv0VGbmPdwgUzbe3PsG1OL4vO1I_H7w42iogOGcb_6R=w1737-h928-ft)

_____________________________________________
Please Read First!

This code remains in a work-in-progress state with all that that entails. Here's a sample of some needed changes:

- better variable naming
- more thorough code comments
- unit tests
- implementation of IIFE's for scope management
- some tweaks to the declarative JSON syntax for clarity, brevity, organization, etc.
- overall better organization

For further details regarding the "why" behind this state of affairs please see my website: [ ]

Further, this code was written in 2011 with pre-ES2015 syntax; that means no computed property names for object literals, no for...of loops, destructuring assignment, etc. etc.
_____________________________________________

To load and play around with this code just download the 'editor demo' folder then open and load the 'editor.html' file in a browser.

With the exception of the text 'Floweo Editor v.1.0' and the neighboring text field, everything on screen is draggable to allow
rearranging.

Commands:
- mouse over the text field to the right of the 'Load' button to see a pop-up holding any objects saved to Local Storage
  - if there are any objects in storage, type the object's value (not the key!) into the text field and press 'Load' to load it onscreen
- mouse over any object on screen and an editor box will pop up to reveal the object's details
- move the mouse off of the object to remove the editor box
- click on the editor box pop-up to keep it on the screen for editing
- press 'Ctrl' and then double-click anywhere on the screen to bring up an Autogram editor box for a new object.

Autogram Editor Box
- you can modify any of the JSON literal syntax, press the
- 'Set' button to see the changes (must do this first! before saving to persist changes)
- 'Save' to save a serializable version of the Autogram to LocalStorage in the browser
- 'Close' removes the editor box
- 'Unload' lets you remove an Autogram from the screen
- 'Run Tasks' let's you run any serial or parallel tasks (aka tweens) you've created --> and added to the Behaviors Object <--
- 'Delete' removes the autogram from the screen and Local Storage

This demo demonstrates all of the main motivations for wrapping a normal DOM object with the thinnest of JSON literal syntax wrappers in order to allow:

- dynamic offsets: when a base object is moved all linked objects move with it (e.g. try dragging an Autogram Editor box and see how all of the contained elements move with it)
- constraints: callback functions will be triggered when a value is updated so that it violates a set constraint
- tweening of values in serial or parallel using 'Behaviors', which are groups of tasks
- mapping of view model to a possible underlying data model with DataObjs' Input and Output object fields
- easy and direct serialization since it's all just JSON allowing for an entire web app interface to be saved and loaded from a database and have its properties updated on the fly
