import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# (old, new) - context-scoped so replacements are unique/correct
reps = [
# --- language toggle button, inserted before #home nav item ---
('<li><a href="#home" data-nav="home">',
 '<li><button id="langToggle" class="lang-toggle" type="button" aria-label="Switch language / Ganti bahasa">EN</button></li>\n          <li><a href="#home" data-nav="home">'),

# --- nav labels ---
('<span>Home</span>', '<span data-i18n="nav-home">Home</span>'),
('<span>Profile</span>', '<span data-i18n="nav-profile">Profile</span>'),
('<span>Contact</span>', '<span data-i18n="nav-contact">Contact</span>'),
('<span>Education</span>', '<span data-i18n="nav-education">Education</span>'),
('<span>Skills</span>', '<span data-i18n="nav-skills">Skills</span>'),
('<span>Hobbies</span>', '<span data-i18n="nav-hobbies">Hobbies</span>'),
('<span>Projects</span>', '<span data-i18n="nav-projects">Projects</span>'),

# --- skip link ---
('Skip to content</a>', '<span data-i18n="skip">Skip to content</span></a>'),

# --- home ---
('            View Profile\n', '            <span data-i18n="home-cta">View Profile</span>\n'),
('<span class="polaroid-caption">My photo</span>', '<span class="polaroid-caption" data-i18n="home-caption">My photo</span>'),

# --- profile section ---
('<p class="section-kicker">Profile</p>', '<p class="section-kicker" data-i18n="profile-kicker">Profile</p>'),
('<h2>About Me</h2>', '<h2 data-i18n="profile-h2">About Me</h2>'),
("            Hi, I'm Feliza!\n",
 '            <span data-i18n="profile-p1">Hi, I\'m Feliza!</span>\n'),
("            I'm a 4th semester Informatics student in the Jabal Ghafur University. I enjoy exploring technology, learning new things, and turning random ideas into something real.\n",
 '            <span data-i18n="profile-p2">I\'m a 4th semester Informatics student in the Jabal Ghafur University. I enjoy exploring technology, learning new things, and turning random ideas into something real.</span>\n'),
('           I’m also currently working on something that goes beyond coding: improving my English. I’m especially interested in becoming better at listening, speaking, and expressing my thoughts naturally. For me, learning English is not just about grammar or vocabulary — it’s about being able to communicate confidently, access more knowledge, and connect with people beyond my own environment. \n',
 '           <span data-i18n="profile-p4">I’m also currently working on something that goes beyond coding: improving my English. I’m especially interested in becoming better at listening, speaking, and expressing my thoughts naturally. For me, learning English is not just about grammar or vocabulary — it’s about being able to communicate confidently, access more knowledge, and connect with people beyond my own environment.</span>\n'),

# --- contact ---
('<p class="section-kicker">Contact</p>', '<p class="section-kicker" data-i18n="contact-kicker">Contact</p>'),
("<h2>Let's Connect!</h2>", '<h2 data-i18n="contact-h2">Let\'s Connect!</h2>'),
('<p class="section-lead">Got a question, a project idea, or just want to say hi? Reach me here:</p>',
 '<p class="section-lead" data-i18n="contact-lead">Got a question, a project idea, or just want to say hi? Reach me here:</p>'),

# --- back / next (reused everywhere, same translation) ---
('          Back\n        </a>', '          <span data-i18n="back">Back</span>\n        </a>'),
('          Next\n          <svg', '          <span data-i18n="next">Next</span>\n          <svg'),

# --- education ---
('<p class="section-kicker">Education</p>', '<p class="section-kicker" data-i18n="edu-kicker">Education</p>'),
('<h2>My Studying Journey</h2>', '<h2 data-i18n="edu-h2">My Studying Journey</h2>'),
('<p class="edu-level">Elementary School</p>', '<p class="edu-level" data-i18n="edu-elementary">Elementary School</p>'),
('<p class="edu-level">Junior High School</p>', '<p class="edu-level" data-i18n="edu-junior">Junior High School</p>'),
('<p class="edu-level">Vocational High School</p>', '<p class="edu-level" data-i18n="edu-vocational">Vocational High School</p>'),
('<p class="edu-level">University</p>', '<p class="edu-level" data-i18n="edu-university">University</p>'),
('<p class="edu-year">Semester 4 · Ongoing</p>', '<p class="edu-year" data-i18n="edu-ongoing">Semester 4 · Ongoing</p>'),

# --- skills ---
('<p class="section-kicker">Skills</p>', '<p class="section-kicker" data-i18n="skills-kicker">Skills</p>'),
('<h2>What I Bring</h2>', '<h2 data-i18n="skills-h2">What I Bring</h2>'),
('<h3>Web Development</h3>', '<h3 data-i18n="skill1-t">Web Development</h3>'),
('<p>Basic knowledge of HTML, CSS, and JavaScript for building simple, responsive, and interactive web pages.</p>',
 '<p data-i18n="skill1-d">Basic knowledge of HTML, CSS, and JavaScript for building simple, responsive, and interactive web pages.</p>'),
('<h3>Communication</h3>', '<h3 data-i18n="skill2-t">Communication</h3>'),
('<p>Basic English communication skills, with the ability to understand technical information and communicate ideas clearly in written and spoken English.</p>',
 '<p data-i18n="skill2-d">Basic English communication skills, with the ability to understand technical information and communicate ideas clearly in written and spoken English.</p>'),
('<h3>Microsoft Office / Google Workspace</h3>', '<h3 data-i18n="skill3-t">Microsoft Office / Google Workspace</h3>'),
('<p>Basic proficiency in Microsoft Office and Google Workspace for creating documents, presentations, spreadsheets, and managing files.</p>',
 '<p data-i18n="skill3-d">Basic proficiency in Microsoft Office and Google Workspace for creating documents, presentations, spreadsheets, and managing files.</p>'),
('<h3>Git / Version Control</h3>', '<h3 data-i18n="skill4-t">Git / Version Control</h3>'),
('<p>Basic understanding of Git and GitHub for managing project files and tracking changes.</p>',
 '<p data-i18n="skill4-d">Basic understanding of Git and GitHub for managing project files and tracking changes.</p>'),
('<h3>Problem Solving</h3>', '<h3 data-i18n="skill5-t">Problem Solving</h3>'),
('<p>Able to analyze problems, think logically, and find practical solutions to challenges.</p>',
 '<p data-i18n="skill5-d">Able to analyze problems, think logically, and find practical solutions to challenges.</p>'),
('<h3>Adaptability</h3>', '<h3 data-i18n="skill6-t">Adaptability</h3>'),
('<p>Willing and able to learn new tools, technologies, and approaches when facing new challenges.</p>',
 '<p data-i18n="skill6-d">Willing and able to learn new tools, technologies, and approaches when facing new challenges.</p>'),

# --- hobbies ---
('<p class="section-kicker">Hobbies</p>', '<p class="section-kicker" data-i18n="hobbies-kicker">Hobbies</p>'),
('<h2>My Interests</h2>', '<h2 data-i18n="hobbies-h2">My Interests</h2>'),
('<p>Reading</p>', '<p data-i18n="hobby1">Reading</p>'),
('<p>Music</p>', '<p data-i18n="hobby2">Music</p>'),
('<p>Coding Projects</p>', '<p data-i18n="hobby3">Coding Projects</p>'),
('<p>English Literature</p>', '<p data-i18n="hobby4">English Literature</p>'),

# --- projects ---
('<p class="section-kicker">Projects</p>', '<p class="section-kicker" data-i18n="projects-kicker">Projects</p>'),
("<h2>Things I've Built</h2>", '<h2 data-i18n="projects-h2">Things I\'ve Built</h2>'),
("<p class=\"section-lead\">Here's a peek at something I've built — more coming soon!</p>",
 '<p class="section-lead" data-i18n="projects-lead">Here\'s a peek at something I\'ve built — more coming soon!</p>'),
('<p class="project-desc">A cute, interactive birthday website template — photo gallery, love letter, reason list, and confetti!</p>',
 '<p class="project-desc" data-i18n="proj1-d">A cute, interactive birthday website template — photo gallery, love letter, reason list, and confetti!</p>'),
('<p class="project-desc">Custom acrylic greeting board rental website — users can select a design, customize the wording with a live preview, and instantly book their rental via WhatsApp.</p>',
 '<p class="project-desc" data-i18n="proj2-d">Custom acrylic greeting board rental website — users can select a design, customize the wording with a live preview, and instantly book their rental via WhatsApp.</p>'),
('                View project\n', '                <span data-i18n="view-project">View project</span>\n'),
('                Visit on GitHub\n', '                <span data-i18n="visit-github">Visit on GitHub</span>\n'),
('<p>Project coming soon</p>', '<p data-i18n="proj-soon">Project coming soon</p>'),

# --- footer ---
('<p class="footer-name">Feliza\'s Portfolio.</p>', '<p class="footer-name" data-i18n="footer-name">Feliza\'s Portfolio.</p>'),
('Personal Portfolio.</p>', '<span data-i18n="footer-copy">Personal Portfolio.</span></p>'),
]

for old, new in reps:
    if old not in html:
        print("MISSING:", repr(old[:60]))
    html = html.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("done")
