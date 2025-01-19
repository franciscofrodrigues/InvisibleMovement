async function visualization() {
  // const fetchStartDate = "2024-11-01";
  // const fetchEndDate = "2024-12-05";

  d3.select("#vis-container").selectAll("*").remove();

  let distance, activeMinutes, sleep, activity, dayTime, type;

  const currentLink = document.querySelector("#login-link");
  if (currentLink.innerText === "Logout") {
    // Dados API
    activity = await getData("activity", fetchStartDate, fetchEndDate);
    sleep = await getData("sleep", fetchStartDate, fetchEndDate);
    activeMinutes = await getData("active_minutes", fetchStartDate, fetchEndDate);
    distance = await getData("distance", fetchStartDate, fetchEndDate);

    console.log(fetchStartDate, fetchEndDate);
  } else {
    // Dados estáticos (semana)
    distance = [10, 5, 2, 7, 8, 4, 5];
    activeMinutes = [200, 60, 130, 250, 10, 80, 30];
    sleep = [8, 7, 7, 10, 8, 5, 10];

    type = [8, 1, 82, 12, 7, 108, 29];
    dayTime = [18, 12, 11, 8, 14, 18, 20];
    activity = type.map((d, i) => ({
      type: type[i],
      dayTime: dayTime[i],
    }));
  }

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // JSON
  const data = distance.map((d, i) => ({
    distance: distance[i] || 0,
    activityTime: activeMinutes[i] || 0,
    activityType: (activity[i] && activity[i].type) || 0,
    activityHour: (activity[i] && activity[i].dayTime) || 0,
    sleep: sleep[i] || 0,
  }));
  console.log(data);

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Container Visualização
  const container = document.querySelector("#vis-container");
  const containerComputedStyle = window.getComputedStyle(container);
  let containerWidth = container.offsetWidth;
  let containerHeight = container.offsetHeight;

  // Subtrair o Padding
  containerWidth -= parseFloat(containerComputedStyle.paddingLeft) + parseFloat(containerComputedStyle.paddingRight);
  containerHeight -= parseFloat(containerComputedStyle.paddingTop) + parseFloat(containerComputedStyle.paddingBottom);

  // Largura Máxima para Retângulo (Dia)
  const dayMaxSize = containerWidth;

  // Altura para Retângulo (Dia)
  let dayHeight;
  if (viewType === "month" || viewType === "year") dayHeight = containerHeight / 4;
  else dayHeight = containerHeight;

  // Dia
  let xPos = 0;
  let yPos = 0;
  let incXPos = 0;

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Escala
  // Tempo (Horizontal)
  const timeScale = d3
    .scaleLinear()
    .domain([0, 480]) // 8h
    .range([dayMaxSize / 4, dayMaxSize]);

  // Cor de fundo
  const timeDayColor = d3.scaleThreshold().domain([12, 18]).range(["#ECDDD1", "#9D826F", "#140E02"]);

  // Cor de atividades
  const typesColors = ["#C9EDDC", "#00548B", "#1B544C", "#9FA3F8", "#D10003", "#EEC8C9", "#FFA200", "#FFCA5C"];
  const activityTypes = [1, 7, 8, 12, 29, 80, 82, 108];
  const activityColor = d3.scaleOrdinal().domain(activityTypes).range(typesColors);

  // Tamanho barras horizontais
  const sleepScale = d3
    .scaleLinear()
    .domain([0, 12])
    .range([10, dayHeight / 10]);

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  let w = 0;
  for (let i = 0; i < data.length; i++) {
    w += timeScale(data[i].activityTime); // Calcular largura necessária
  }

  // SVG
  const svg = d3.select("#vis-container").append("svg").attr("width", w).attr("height", containerHeight);

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // SVG
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("g")
    .each(function (d, i) {
      // Para cada dia
      const g = d3.select(this);
      let dayWidth = timeScale(d.activityTime);

      // Limites
      if (i % 7 == 0 && viewType === "month") {
        xPos = 0;
        yPos += dayHeight; // Passar para baixo
      }
      if (yPos >= containerHeight) {
        incXPos += containerWidth;
        yPos = 0;
      }

      // Ordem
      svg.append("g").attr("id", "days");
      svg.append("g").attr("id", "verticalLines");
      svg.append("g").attr("id", "horizontalLines");
      svg.append("g").attr("id", "text");

      // Grupo DIA (retângulo de fundo)
      svg
        .select("#days")
        .append("rect")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", dayWidth) // Largura conforme tempo de atividade
        .attr("height", dayHeight)
        .attr("fill", timeDayColor(d.activityHour)) // Cor de acordo com a hora do dia
        .on("mouseover", function () {
          d3.select("#vis-info")
            .transition()
            .text("Distância: " + d.distance + "km · Tempo Ativo: " + Math.floor(d.activityTime / 60) + "h · Tipo de Atividade: " + d.activityType + " · Sono: " + d.sleep + "h")
            .style("display", "flex");
        })
        .on("mouseout", function () {
          d3.select("#vis-info").transition().text("").style("display", "none");
        });

      // Grupo DISTÂNCIA (retângulos verticais)
      const distanceLines = d.distance;
      let VLWidth = containerWidth / 400; // Responsivo ao tamanho do ecrã
      const distanceGroup = svg.select("#verticalLines").append("g");

      distanceGroup
        .selectAll("rect")
        .data(d3.range(distanceLines))
        .enter()
        .append("rect")
        .attr("x", (d, i) => Math.random() * dayWidth + xPos)
        .attr("y", yPos)
        .attr("width", VLWidth)
        .attr("height", dayHeight)
        .attr("fill", (d) => {
          // Bege
          if (timeDayColor(data[i].activityHour) !== "#140E02") {
            return "#000"; // Linhas pretas
          } else {
            return "#fff"; // Linhas brancas
          }
        });

      // Grupo ATIVIDADE (retângulos horizontais)
      const activityLines = Math.floor(d.activityTime / 60); // Para cada hora de atividade
      const activityGroup = svg.select("#horizontalLines").append("g");

      activityGroup
        .selectAll("rect")
        .data(d3.range(activityLines))
        .enter()
        .append("rect")
        .attr("x", xPos)
        .attr("y", (d, i) => Math.random() * dayHeight + yPos)
        .attr("width", dayWidth)
        .attr("height", sleepScale(d.sleep)) // Tamanho dependente do sono
        .attr("fill", activityColor(d.activityType)); // Cor dependente do tipo de atividade

      // Posicionar lado a lado
      xPos += timeScale(d.activityTime);
    });
}

visualization();
