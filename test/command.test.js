var Command = require('../lib/command');

describe('gulp-run/lib/command', function commandTestCase() {
  describe('#toString', function toStringTestCase() {
    it('returns the template', function returnTemplateTest() {
      var template = 'Hi <%= name %>';
      var command = new Command(template, {});

      command.toString().should.equal(template);
    });
  });
});
