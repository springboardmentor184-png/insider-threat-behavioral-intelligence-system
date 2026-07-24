// import {
//     Chart as ChartJS,
//     ArcElement,
//     Tooltip,
//     Legend
// } from "chart.js";

// import { Doughnut } from "react-chartjs-2";

// ChartJS.register(
//     ArcElement,
//     Tooltip,
//     Legend
// );

// const data = {
//     labels: ["Low","Medium","High"],
//     datasets:[
//         {
//             data:[65,25,10],
//             backgroundColor:[
//                 "#22c55e",
//                 "#facc15",
//                 "#ef4444"
//             ]
//         }
//     ]
// };

// const options = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       position: "top",
//     },
//   },
// };

// export default function RiskChart(){

//     return(
// //         <div className="flex justify-center items-center h-[320px]">
// //   <div className="w-72 h-72">
// //     <Doughnut data={data} options={options} />
// //   </div>
// // </div>
// <div className="bg-white rounded-2xl shadow-sm p-6">

//     <h2 className="text-2xl font-bold mb-6">
//         Risk Distribution
//     </h2>

//     <div className="flex justify-center">
//         <div className="w-64 h-64">
//             <Doughnut
//                 data={data}
//                 options={options}
//             />
//         </div>
//     </div>

// </div>
//     )

// }


import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "top",
        },
    },
};

export default function RiskChart({ data }) {

    const chartData = {
        labels: Object.keys(data),

        datasets: [
            {
                data: Object.values(data),

                backgroundColor: [
                    "#22c55e",   // Low
                    "#facc15",   // Medium
                    "#ef4444",   // High
                    "#7c3aed"    // Critical
                ],

                borderWidth: 1
            }
        ]
    };

    return (

        <div className="bg-white rounded-2xl shadow-sm p-6">

            <h2 className="text-2xl font-bold mb-6">
                Risk Distribution
            </h2>

            <div className="flex justify-center">

                <div className="w-64 h-64">

                    <Doughnut
                        data={chartData}
                        options={options}
                    />

                </div>

            </div>

        </div>

    );
}