const content = window.ProgramStyleContent.get();
const homeContent = content.home;

document.getElementById("home-title").textContent = homeContent.title;
document.getElementById("home-description").textContent = homeContent.description;
document.getElementById("home-services-button").textContent = homeContent.servicesButton;
document.getElementById("home-admin-button").textContent = homeContent.adminButton;
document.getElementById("home-projects-label").textContent = homeContent.projectsLabel;
document.getElementById("home-projects-title").textContent = homeContent.projectsTitle;
document.getElementById("home-projects-description").textContent = homeContent.projectsDescription;

const projectGrid = document.getElementById("home-project-grid");
homeContent.projects.forEach((project) => {
  const card = document.createElement("a");
  card.href = project.url;
  card.target = "_blank";
  card.rel = "noreferrer";
  card.className = "project-card";

  const image = document.createElement("img");
  image.src = project.image;
  image.alt = project.alt;

  const info = document.createElement("div");
  info.className = "project-info";

  const name = document.createElement("h3");
  name.textContent = project.name;

  const description = document.createElement("p");
  description.textContent = project.description;

  info.append(name, description);
  card.append(image, info);
  projectGrid.appendChild(card);
});