async function visualization() {
  // const fetchStartDate = year+"-"+month+"-"+day;

  const fetchStartDate = "2024-12-02";
  const fetchEndDate = "2024-12-06";

  // Dados API
  const activity = await getData("activity", fetchStartDate, fetchEndDate);
  console.log(activity);

  const sleep = await getData("sleep", fetchStartDate, fetchEndDate);
  console.log(sleep);

  const activeMinutes = await getData("active_minutes", fetchStartDate, fetchEndDate);
  console.log(activeMinutes);

  const distance = await getData("distance", fetchStartDate, fetchEndDate);
  console.log(distance);
  
  // const distance = await getData("distance", fetchStartDate, fetchEndDate);
  // console.log(distance);

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // let distance = [5, 10, 7, 2, 4, 5, 8];
  let activityTime = [60, 200, 250, 130, 80, 30, 10];
  let activityHour = [0, 12, 14, 16, 20, 20, 23];
  let activityType = [1, 3, 2, 4, 5, 10, 7];
  let activityEffort = [5, 8, 2, 4, 9, 7, 5];
  // let sleep = [7, 8, 10, 7, 5, 10, 8];

  // JSON
  const data = distance.map((d, i) => ({
    distance: distance[i],
    activityTime: activeMinutes[i],
    // activityHour: activity[i].dayTime,
    // activityType: activity[i].type,
    activityHour: activityHour[i],
    activityType: activityType[i],
    sleep: sleep[i],
  }));

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Container Visualização
  const container = document.querySelector("#vis-container");
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  
  // const numDays = 7;
  const dayMaxSize = containerWidth;

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  
  // Escala
  // Tempo (Horizontal)
  const timeScale = d3.scaleLinear()
    .domain([0, 500])
    .range([dayMaxSize/4, dayMaxSize])

  // Cor de fundo
  const timeDayColor = d3.scaleThreshold()
    .domain([7, 16]) 
    .range(["#ECDDD1", "#9D826F", "#140E02"]);

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

let w = 0;
for(let i=0; i<data.length; i++) {
  w += timeScale(data[i].activityTime);
}

// SVG
const svg = d3.select("#vis-container")
  .append("svg")
  .attr("width", w)
  .attr("height", "100%");

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  // Dia
  let xPos = 0;
  let yPos = 0;

  // let dayHeight = containerHeight/4;
  let dayHeight = containerHeight;

  // SVG
  svg.selectAll("rect")
  .data(data)
  .enter()
  .append("g")
  .each(function(d, i) { // Para cada dia
    const g = d3.select(this);
    let dayWidth = timeScale(d.activityTime);

    // Limites
    // if (xPos + dayWidth > containerWidth) {
    //   xPos = 0;
    //   yPos += dayHeight; // Passar para baixo
    // }

    // Grupo DIA (retângulo de fundo)
    g.append("rect")    
      .attr("id", "day-"+i)
      .attr("x", xPos)
      .attr("y", yPos)
      .attr("width", dayWidth) // Largura conforme tempo de atividade
      .attr("height", dayHeight)
      .attr("fill", timeDayColor(d.activityHour)); // Cor de acordo com a hora do dia
    

    // Grupo DISTÂNCIA (retângulos verticais)
    const distanceLines = d.distance;
    let VLWidth = containerWidth/200;
    const distanceGroup = g.append("g");

    distanceGroup.selectAll("rect")
      .data(d3.range(distanceLines))
      .enter()
      .append("rect")
      .attr("id", (d, i) => "distance-"+i)
      // .attr("x", (d,i) => i * (VLWidth + VLSpaceBetween) + xPos)
      .attr("x", (d,i) => (Math.random() * dayWidth) + xPos)
      .attr("y", yPos)
      .attr("width", VLWidth)
      .attr("height", dayHeight)
      .attr("fill", (d) => {
        // Ensure the color is returned properly
        if (timeDayColor(data[i].activityHour) !== "#140E02") {
          return "#000"; // dark color for night time
        } else {
          return "#fff"; // light color for day time
        }
      });


    // Grupo ATIVIDADE (retângulos horizontais)
    const activityLines = Math.floor(d.activityTime / 60);
    const HLHeight = (dayHeight/4)/activityLines;
    const offsetHeight = (dayHeight - (activityLines * (HLHeight*2))) / 2;
    const activityeGroup = g.append("g");

    activityeGroup.selectAll("rect")
      .data(d3.range(activityLines))
      .enter()
      .append("rect")
      .classed("up-line", (d, i) => i % 2 === 0)
      .attr("id", (d, i) => "activity-"+i)
      .attr("x", xPos)
      .attr("y", (d,i) => i * (HLHeight + HLHeight) + yPos + dayHeight/4)
      // .attr("y", (d,i) => (Math.random() * dayHeight) + yPos)
      .attr("width", timeScale(d.activityTime))
      .attr("height", HLHeight)
      .attr("fill", "#FFD47B");

    // Posicionar lado a lado  
    xPos += timeScale(d.activityTime); 
  });

}

visualization();