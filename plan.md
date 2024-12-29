Automatically generate a good-enough loading screen for
every page.tsx (and eventually for everything that needs a suspense / loading state)

how to demonstrate its usefulness

comparisons
- instagram loading shimmer
- annoyance of layout shift

demo
- have a server component that takes a while to load
- with images, text, and layout
- show the autogen
- then add some nested card component

reasons why you dont want to do it yourself
- you want to focus on business logic
- it doesnt stay up-to-date with layout cjanges
- therr are sometimes nested components that make it nontrigis

why this approach?
- still uour code and lives in your repo
- compatible with your version control
- customize whatever you want
- evolves with your codebase
- eject or stop using at any time 

in the future
- smooth mode vs leaf mode where we try and fill in sub-data like "Welcome shinmer"
- get all relevant files
- do same for suspense