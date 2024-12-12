async function visualization() {
  const fetchStartDate = "2024-11-01";
  const fetchEndDate = "2024-12-05";

    // Dados API
    const activity = await getData("activity", fetchStartDate, fetchEndDate);
    const sleep = await getData("sleep", fetchStartDate, fetchEndDate);
    const activeMinutes = await getData("active_minutes", fetchStartDate, fetchEndDate);
    const distance = await getData("distance", fetchStartDate, fetchEndDate);
    
  //   // Dados estáticos (semana)
  //   const distance = [5, 10, 7, 2, 4, 5, 8];
  //   const activeMinutes = [60, 200, 250, 130, 80, 30, 10];
  //   const sleep = [7, 8, 10, 7, 5, 10, 8];

  //   const type = [1, 8, 12, 82, 108, 29, 7];
  //   const dayTime = [12, 18, 8, 11, 18, 20, 14];
  //   const activity = type.map((d, i) => ({
  //     type: type[i],
  //     dayTime: dayTime[i],
  //   }));
  // }

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
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  const dayMaxSize = containerWidth;
  let dayHeight = containerHeight;

  // Dia
  let xPos = 0;
  let yPos = 0;

  // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Escala
  // Tempo (Horizontal)
  const timeScale = d3
    .scaleLinear()
    .domain([0, 500])
    .range([dayMaxSize / 4, dayMaxSize]);

  // Cor de fundo
  const timeDayColor = d3.scaleThreshold().domain([12, 18]).range(["#ECDDD1", "#9D826F", "#140E02"]);

  // Cor de atividades
  const typesColors = ["#C9EDDC", "#00548B", "#1B544C", "#9FA3F8", "#D10003", "#EEC8C9", "#FFA200", "#FFCA5C"];
  const activityTypes = [1, 7, 8, 12, 29, 80, 82, 108];
  const activityColor = d3.scaleOrdinal().domain(activityTypes).range(typesColors);

  const activityTimeScale = d3
    .scaleLinear()
    .domain([0, 500])
    .range([10, dayHeight / 10]);

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
  const svg = d3.select("#vis-container").append("svg").attr("width", w).attr("height", "100%");

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
      // if (xPos + dayWidth > containerWidth) {
      //   xPos = 0;
      //   yPos += dayHeight; // Passar para baixo
      // }

      // Grupo DIA (retângulo de fundo)
      g.append("rect")
        .attr("id", "day-" + i)
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", dayWidth) // Largura conforme tempo de atividade
        .attr("height", dayHeight)
        .attr("fill", timeDayColor(d.activityHour)); // Cor de acordo com a hora do dia

      // Grupo DISTÂNCIA (retângulos verticais)
      const distanceLines = d.distance;
      let VLWidth = containerWidth / 200; // Responsivo ao tamanho do ecrã
      const distanceGroup = g.append("g");

      distanceGroup
        .selectAll("rect")
        .data(d3.range(distanceLines))
        .enter()
        .append("rect")
        .attr("id", (d, i) => "distance-" + i)
        .attr("x", (d, i) => Math.random() * dayWidth + xPos)
        .attr("y", yPos)
        .attr("width", VLWidth)
        .attr("height", dayHeight)
        .attr("fill", (d) => {
          if (timeDayColor(data[i].activityHour) !== "#140E02") {
            // Bege
            return "#000"; // Linhas pretas
          } else {
            return "#fff"; // Linhas brancas
          }
        });

      // Grupo ATIVIDADE (retângulos horizontais)
      const activityLines = Math.floor(d.activityTime / 60); // Para cada min de atividade
      const activityeGroup = g.append("g");

      activityeGroup
        .selectAll("rect")
        .data(d3.range(activityLines))
        .enter()
        .append("rect")
        .attr("id", (d, i) => "activity-" + i)
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
