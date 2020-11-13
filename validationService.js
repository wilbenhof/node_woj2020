const isValidCustomer = (customer) => {
    if (!customer.nimi) return false;
    if (!customer.osoite) return false;
    if (!customer.postinro) return false;
    if (!customer.postitmp) return false;
    if (!customer.asty_avain) return false;
    return true;
};

const isValidIdentifier = (id) => {
    const result = Number.isInteger(parseInt(id,10));
    console.log(result);
    return result;
}

module.exports = {
    isValidCustomer,
    isValidIdentifier
}