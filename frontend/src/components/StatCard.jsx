function StatCard({ title, value }) {

    return (

        <div className="bg-white rounded-xl shadow-lg p-6">

            <h3 className="text-slate-500 text-sm mb-2">

                {title}

            </h3>

            <p className="text-3xl font-bold text-slate-800">

                {value}

            </p>

        </div>

    );

}

export default StatCard;