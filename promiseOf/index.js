/**
 * Created by ska on 4/9/17.
 */
module.exports = (fn, beforeResolve, beforeReject) => {
    return new Promise((resolve, reject) => {
        fn(function(err, ...res){
            if (err) {
                if (typeof beforeReject === 'function') {
                    res = beforeReject(err);
                    if (res) return resolve.apply(this, res);
                }
                return reject(err);
            }
            if (typeof beforeResolve === 'function') res = beforeResolve(res);
            return resolve.apply(this, res);

        })
    });
};