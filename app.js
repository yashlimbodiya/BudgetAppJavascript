//Module Budget Controller
var budgetController = (function () {

    // Function Constructor for Expenses
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Prototype property of Expenses constructor to calculate percentage
    Expense.prototype.calculatePercent = function (totalIncome) {
        
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Prototype property of Expenses constructor to return percentage
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    // Function Constructor for Incomes
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Calculating Total sum of List
    var calculateTotal = function(type) {
        
        var sum = 0;
        
        // Using forEach loop for sumation
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });

        // Storing the sum value in respective Data structure
        data.totals[type] = sum;
    };

    // Structured data to store all the entries
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // Adding entries in data structure
    return {
        addItem: function (type, des, val) {
            
            var newItem, ID;
            
            // Giving unique ID to all Entries acc to length of Data structure
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Creating newItem based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Pushing newItems in the arrays
            data.allItems[type].push(newItem);

            return newItem;
        },

        // Method for deleting item
        deleteItem: function (type, id) {

            var ids, index;

            // We have to find index of entry associated with given ID from the DS
            ids = data.allItems[type].map(function (current) {
                
                // This return an array of entries with ids only, not other details
                return current.id;
            });

            // Knowing the index of given id
            index = ids.indexOf(id);

            if (index !== -1) {

                // We are using splice() to remove items from array
                // This take 2 arguments (Starting indexes, no. of entries)
                data.allItems[type].splice(index, 1);
            }

        },

        // Method for calculating budget 
        calculateBudget: function () {

            // Calculating Sum of all entries
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculating the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculating percentage of income that has been spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        // Method for calculating percentages
        calculatePercentages: function () {

            data.allItems.exp.forEach(function (curr) {
                curr.calculatePercent(data.totals.inc);
            });
        },

        // Method for returning percentages
        getPercentages: function () {
            var allPercent = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            return allPercent;
        },

        // Method for returning budget details
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };
  
})();

//Module UI Controller
var UIcontroller = (function () {

    // Creating all the classes of HTML a property of some object, it will help in updating classes names in far future
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

                // Method for formating numbers on UI
               var formatNumber = function(num, type) {

                    var numSplit, int, deci, sign;
    
                    // Removing any sign of number using Math.abs()
                    num = Math.abs(num);
    
                    // Reducing decimal places upto 2 digits
                    num = num.toFixed(2);   // num becomes string here
    
                    // spliting number into 2 parts 
                    numSplit = num.split('.');
    
                    int = numSplit[0];
                    deci = numSplit[1];
    
                    // Adding (,) to int part
                    if (int.length > 3) {
                        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
                        // input -> 23510 , output -> 23,510
                    }
    
                    // Adding (+) sign to income & (-) sign to expense
                    type === 'exp' ? sign = '-' : sign = '+';
    
                    return sign + ' ' + int + '.' + deci;
    
                };

                var nodeListForEach = function (list, callback) {

                    for (var i = 0; i < list.length; i++) {
                        callback(list[i], i);
                    }
                };

    return {
            // Public method for getting inputs
            getInput: function () {
                return {
                    type: document.querySelector(DOMstrings.inputType).value,
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  // This will be a number

                };
            },

            // Public method to send DOMstrings
            getDOMstrings: function () {
                return DOMstrings;
            },

            // Public method to Add List item
            addListItem: function (obj, type) {

                var html, newHtml, element;

                // Creating HTML string with placeholder text
                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                } else if (type === 'exp') {
                    element = DOMstrings.expensesContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }

                // Replacing the placeholder with actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

                // Inserting the HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


            },

            // Deleting list item from UI
            deleteListItem: function (selectorID) {

                var ele = document.getElementById(selectorID);

                ele.parentNode.removeChild(ele);
            },

            // Public method to clear text field after uploading entries
            clearFields: function () {
                var fields, fieldsArray;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                fieldsArray = Array.prototype.slice.call(fields);

                fieldsArray.forEach(function (current, index, array) {
                    current.value = "";
                });

                fieldsArray[0].focus();
            },

            // Method for displaying percentages on UI
            displayPercentages: function (percentages) {

                var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

                nodeListForEach(fields, function (current, index) {
                    
                    if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '--';
                    }
                });
            },

            // Method for displaying budget on UI
            displayBudget: function (obj) {

                var type;

                obj.budget > 0 ? type = 'inc' : type = 'exp';

                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                
                // When the income < 0
                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '--';
                }

            },

            // Method for displaying Month
            displayMonth: function () {

                var now, year, month, monthsArr;
                now = new Date();

                year = now.getFullYear();

                month = now.getMonth();

                monthsArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

                document.querySelector(DOMstrings.dateLabel).textContent = monthsArr[month] + ' ' + year;
  
            },

            // Method to change box color acc to inc or exp
            changedType: function () {

                var fields = document.querySelectorAll(
                    DOMstrings.inputType + ',' +
                    DOMstrings.inputDescription + ',' +
                    DOMstrings.inputValue);

                nodeListForEach(fields, function (curr) {
                    curr.classList.toggle('red-focus');
                });  
                
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
                
            }


    };
})();

// Module Global App controller, that combine both module
var controller = (function (budgetControl, UIcontrol) {

    // Function organizing Event Listeners
    var setupEventListeners = function () {

        // Getting values vio DOMstrings variable
        var DOM = UIcontrol.getDOMstrings();

        // Clicked on submit button
        document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);

        // Pressed Enter key
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                controlAddItem();
            }
        });

        // Clicked on delete button 
        document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);

        // To change the color of description box in html acc to inc or exp
        document.querySelector(DOM.inputType).addEventListener('change', UIcontrol.changedType);
    };
    
    // Method for updating budget
    var updateBudget = function () {

        // Calculate the budget
        budgetControl.calculateBudget();

        // Getting budget details from Data structure
        var budget = budgetControl.getBudget();

        // Display budget on UI
        UIcontrol.displayBudget(budget);
    };

    // Function that update percentage of expenses
    var updatePercentages = function () {

        // Calculate percentage
        budgetControl.calculatePercentages();

        // Read percentages from the budget controller
        var percentages = budgetControl.getPercentages();

        // Updating the UI with new percentages
        UIcontrol.displayPercentages(percentages);
    };

    // Function that add item in the list
    var controlAddItem = function () {
        var input, newItem;

        // Get Input from html text field and from drop down list
        input = UIcontrol.getInput();

        // Checking for the empty description OR blank values
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // Adding the entries in the budget module and in the Data structure
            newItem = budgetControl.addItem(input.type, input.description, input.value);

            //Adding item to the UI
            UIcontrol.addListItem(newItem, input.type);

            // Clearing fields after submitting
            UIcontrol.clearFields();

            // Calculate and update budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
  
    };

    // Method that delete items 
    var controlDeleteItem = function (event) {
         
        var itemID, splitID, type, ID;

        // Gettind ID of entry whom to be deleted
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // Splitting entry's type and ID
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Deleting the item from Data Structure
            budgetControl.deleteItem(type, ID);

            // Deleting the item from UI
            UIcontrol.deleteListItem(itemID);

            // Updating and showing the new budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {

            // Displaying month
            UIcontrol.displayMonth();

            // Displaying budget
            UIcontrol.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 
            });
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);

// Without this statment nothing starts OR Initializing function
controller.init();