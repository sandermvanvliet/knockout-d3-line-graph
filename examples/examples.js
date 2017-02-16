/* global ko */
function ViewModel() {
    var self = this;

    self.example1 = ko.observableArray([2, 1, 2, 3]);
    self.example1Add = function () {
        var min = 0,
            max = 9,
            randomNumber = Math.random() * (max - min) + min;

        self.example1.push(randomNumber);
        self.complexData.push({ position: new Date(2015, 1, self.complexData().length + 1), value: randomNumber, baseLine: 7 });
        self.multiComplexData.push({ position: new Date(2015, 1, self.complexData().length + 1), value: randomNumber, id: 'a' });
    };

    self.example2 = ko.computed(function () {
        return self.example1().slice(-10);
    });

    self.complexData = ko.observableArray([
        { position: new Date(2015, 1, 1), value: 10, baseLine: 4 },
        { position: new Date(2015, 1, 2), value: 8, baseLine: 4 },
        { position: new Date(2015, 1, 3), value: 12, baseLine: 5 },
        { position: new Date(2015, 1, 4), value: 13, baseLine: 5 },
        { position: new Date(2015, 1, 5), value: 11, baseLine: 7 },
        { position: new Date(2015, 1, 6), value: 7, baseLine: 7 },
        { position: new Date(2015, 1, 7), value: 5, baseLine: 7 }
    ]);

    self.multiComplexData = ko.observableArray([
        { position: new Date(2015, 1, 1), value: 10, id: 'a' },
        { position: new Date(2015, 1, 2), value: 8, id: 'a' },
        { position: new Date(2015, 1, 3), value: 12, id: 'a' },
        { position: new Date(2015, 1, 4), value: 13, id: 'a' },
        { position: new Date(2015, 1, 5), value: 11, id: 'a' },
        { position: new Date(2015, 1, 6), value: 7, id: 'a' },
        { position: new Date(2015, 1, 7), value: 5, id: 'a' },

        { position: new Date(2015, 1, 1), value: 1, id: 'b' },
        { position: new Date(2015, 1, 2), value: 2, id: 'b' },
        { position: new Date(2015, 1, 3), value: 3, id: 'b' },
        { position: new Date(2015, 1, 4), value: 2, id: 'b' },
        { position: new Date(2015, 1, 5), value: 1, id: 'b' },
        { position: new Date(2015, 1, 6), value: 2, id: 'b' },
        { position: new Date(2015, 1, 7), value: 3, id: 'b' }
    ]);
}

var viewModel = new ViewModel();

ko.applyBindings(viewModel);
